import { describe, expect, it } from 'vitest';
import {
  evaluateCalculatorExpression,
  formatExpressionDisplay,
  parseUpiSms,
} from '@/lib/utils/calculator';

describe('evaluateCalculatorExpression', () => {
  it('evaluates basic arithmetic and respects PEMDAS precedence', () => {
    expect(evaluateCalculatorExpression('180+45')).toBe(225);
    expect(evaluateCalculatorExpression('100+25*2')).toBe(150);
    expect(evaluateCalculatorExpression('500-120/4')).toBe(470);
    expect(evaluateCalculatorExpression('180×3÷2')).toBe(270);
  });

  it('strips commas, currency symbols, whitespace, and trailing dangling operators', () => {
    expect(evaluateCalculatorExpression('₹1,200 + 80.50')).toBe(1280.5);
    expect(evaluateCalculatorExpression('120+')).toBe(120);
    expect(evaluateCalculatorExpression('45.5*2-')).toBe(91);
  });

  it('returns null on division by zero or invalid tokens without throwing', () => {
    expect(evaluateCalculatorExpression('100/0')).toBeNull();
    expect(evaluateCalculatorExpression('12..5+3')).toBeNull();
    expect(evaluateCalculatorExpression('alert(1)')).toBeNull();
    expect(evaluateCalculatorExpression('')).toBeNull();
  });
});

describe('formatExpressionDisplay', () => {
  it('converts ASCII operators into display glyphs', () => {
    expect(formatExpressionDisplay('120*3/2+5')).toBe('120×3÷2+5');
  });
});

describe('parseUpiSms', () => {
  it('extracts rupees, merchant note, and bank signal from UPI debit alerts', () => {
    const parsed = parseUpiSms('Paid Rs. 240.50 to Swiggy via GPay UPI ref 431209');
    expect(parsed).toEqual({
      amount: 240.5,
      note: 'Swiggy',
      accountId: 'bank',
    });
  });

  it('extracts comma-formatted INR amounts without bank tag if purely cash/generic', () => {
    const parsed = parseUpiSms('Debited by ₹1,450 at Cafe Coffee Day on 12 Nov');
    expect(parsed?.amount).toBe(1450);
    expect(parsed?.note).toBe('Cafe Coffee Day');
  });

  it('returns null when SMS contains neither amount nor merchant', () => {
    expect(parseUpiSms('OTP for login is 889212')).toBeNull();
  });
});

