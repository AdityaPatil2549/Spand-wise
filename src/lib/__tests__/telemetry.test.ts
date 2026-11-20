import { describe, it, expect, vi } from 'vitest';
import { logger } from '../telemetry/logger';
import { SectionErrorBoundary } from '@/components/shared/SectionErrorBoundary';

describe('Telemetry & Section Error Boundary Layer', () => {
  it('formats structured logger outputs cleanly without throwing', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.info('User navigated to analytics', { route: '/analytics' });
    logger.warn('Pace threshold reached', { variance: -500 });
    logger.error('Failed to parse OCR image', new Error('Corrupt bitmap payload'), { scannerId: 'cam_1' });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('correctly derives error state in SectionErrorBoundary', () => {
    const error = new Error('Recharts layout crash');
    const state = SectionErrorBoundary.getDerivedStateFromError(error);

    expect(state.hasError).toBe(true);
    expect(state.error).toBe(error);
  });
});
