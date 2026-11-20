/**
 * SpendWise Structured Telemetry Logger.
 * Emits structured JSON diagnostics for offline recovery, network sync events, and runtime errors.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

class TelemetryLogger {
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`, context ? JSON.stringify(context) : '');
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(`[INFO] ${message}`, context ? JSON.stringify(context) : '');
  }

  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context ? JSON.stringify(context) : '');
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    const errorDetails = error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { rawError: error };

    console.error(`[ERROR] ${message}`, { ...errorDetails, ...context });
  }
}

export const logger = new TelemetryLogger();
