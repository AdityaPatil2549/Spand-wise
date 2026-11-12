export interface ParsedUpiSms {
  amount?: number;
  note?: string;
  accountId?: 'bank' | 'cash';
}

const PRECEDENCE: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
};

/**
 * Safe mathematical expression evaluator for the quick-add calculator.
 * Supports +, -, *, ×, /, ÷, decimals, whitespace, and leading unary minus.
 * Never uses eval() or dynamic Function construction.
 */
export function evaluateCalculatorExpression(rawInput: string): number | null {
  if (!rawInput || typeof rawInput !== 'string') return null;

  const normalized = rawInput
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/,/g, '')
    .replace(/₹/g, '')
    .replace(/\s+/g, '')
    .trim();

  if (!normalized) return null;

  // Strip trailing dangling operator while user is mid-expression (e.g. "120+")
  const trimmedExpr = /[+\-*/]$/.test(normalized)
    ? normalized.slice(0, -1)
    : normalized;

  if (!trimmedExpr) return null;
  if (!/^[0-9.+\-*/]+$/.test(trimmedExpr)) return null;

  // Tokenize numbers and binary operators (supporting unary leading minus or after operator)
  const tokens: Array<number | string> = [];
  let i = 0;

  while (i < trimmedExpr.length) {
    const ch = trimmedExpr[i];
    const prev = tokens.length > 0 ? tokens[tokens.length - 1] : null;
    const isUnaryMinus =
      ch === '-' && (prev === null || typeof prev === 'string');

    if (isUnaryMinus || /[0-9.]/.test(ch)) {
      let numStr = isUnaryMinus ? '-' : '';
      if (isUnaryMinus) i++;
      let dotCount = 0;

      while (i < trimmedExpr.length && /[0-9.]/.test(trimmedExpr[i])) {
        if (trimmedExpr[i] === '.') {
          dotCount++;
          if (dotCount > 1) return null;
        }
        numStr += trimmedExpr[i];
        i++;
      }

      if (numStr === '-' || numStr === '.' || numStr === '-.') return null;
      const parsed = Number(numStr);
      if (!Number.isFinite(parsed)) return null;
      tokens.push(parsed);
    } else if (ch in PRECEDENCE) {
      if (typeof prev !== 'number') return null;
      tokens.push(ch);
      i++;
    } else {
      return null;
    }
  }

  if (tokens.length === 0 || typeof tokens[tokens.length - 1] !== 'number') {
    return null;
  }

  // Shunting-yard / two-stack evaluation honoring operator precedence (*, / before +, -)
  const values: number[] = [];
  const ops: string[] = [];

  const applyTopOp = (): boolean => {
    const op = ops.pop();
    const b = values.pop();
    const a = values.pop();
    if (op === undefined || a === undefined || b === undefined) return false;

    let res = 0;
    switch (op) {
      case '+':
        res = a + b;
        break;
      case '-':
        res = a - b;
        break;
      case '*':
        res = a * b;
        break;
      case '/':
        if (b === 0) return false;
        res = a / b;
        break;
      default:
        return false;
    }

    if (!Number.isFinite(res)) return false;
    values.push(res);
    return true;
  };

  for (const token of tokens) {
    if (typeof token === 'number') {
      values.push(token);
    } else {
      while (
        ops.length > 0 &&
        PRECEDENCE[ops[ops.length - 1]] >= PRECEDENCE[token]
      ) {
        if (!applyTopOp()) return null;
      }
      ops.push(token);
    }
  }

  while (ops.length > 0) {
    if (!applyTopOp()) return null;
  }

  if (values.length !== 1 || !Number.isFinite(values[0])) return null;
  return Math.round(values[0] * 100) / 100;
}

/**
 * Formats expression string with user-friendly multiplication and division glyphs.
 */
export function formatExpressionDisplay(expr: string): string {
  return expr.replace(/\*/g, '×').replace(/\//g, '÷');
}

/**
 * Extracts transaction amount, merchant note, and UPI account signal from bank/UPI SMS alerts.
 */
export function parseUpiSms(rawText: string): ParsedUpiSms | null {
  const text = rawText.trim();
  if (!text) return null;

  // Match patterns like Rs. 240.00, INR 1,250, ₹185.50, debited by 320
  const amountRegex =
    /(?:rs\.?|inr|₹|debited\s+(?:by|for|with)|paid\s+of|sent)\s*[:.]?\s*([\d,]+(?:\.\d{1,2})?)/i;
  const amountMatch = text.match(amountRegex);
  const rawAmount = amountMatch?.[1]?.replace(/,/g, '');
  const amount = rawAmount ? parseFloat(rawAmount) : undefined;

  // Match payee after "to", "at", "VPA", or merchant phrasing
  const merchantRegex =
    /(?:\bto\b|\bat\b|\bmerchant\b)\s+([a-zA-Z0-9&._\-\s]{2,32}?)(?:\s+(?:via|on|ref|upi|from|using|for|dated|avl|bal)\b|[.,;\n]|$)/i;
  const merchantMatch = text.match(merchantRegex);
  const cleanNote = merchantMatch?.[1]
    ?.replace(/\s+/g, ' ')
    .trim();

  const isUpiOrBank = /\b(?:upi|bank|a\/c|acct|account|gpay|phonepe|paytm|vpa|neft|imps)\b/i.test(
    text
  );

  if ((!amount || !Number.isFinite(amount) || amount <= 0) && !cleanNote) {
    return null;
  }

  return {
    amount: amount && Number.isFinite(amount) && amount > 0 ? amount : undefined,
    note: cleanNote || undefined,
    accountId: isUpiOrBank ? 'bank' : undefined,
  };
}

