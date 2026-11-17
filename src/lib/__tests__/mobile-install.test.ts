import { describe, it, expect } from 'vitest';

function isMobileUserAgent(ua: string): boolean {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

function isAppleDevice(ua: string): boolean {
  return /iPhone|iPad|iPod/i.test(ua);
}

function isAndroidDevice(ua: string): boolean {
  return /Android/i.test(ua);
}

describe('Smartphone Detection Logic', () => {
  it('correctly detects modern Android smartphones', () => {
    const pixelUa = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
    expect(isMobileUserAgent(pixelUa)).toBe(true);
    expect(isAndroidDevice(pixelUa)).toBe(true);
    expect(isAppleDevice(pixelUa)).toBe(false);
  });

  it('correctly detects iPhones and iOS Safari', () => {
    const iphoneUa = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
    expect(isMobileUserAgent(iphoneUa)).toBe(true);
    expect(isAppleDevice(iphoneUa)).toBe(true);
    expect(isAndroidDevice(iphoneUa)).toBe(false);
  });

  it('correctly rejects desktop browsers so mobile prompts remain hidden on PC', () => {
    const windowsChrome = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
    const macSafari = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15';
    expect(isMobileUserAgent(windowsChrome)).toBe(false);
    expect(isMobileUserAgent(macSafari)).toBe(false);
  });

  it('determines offline status properly from navigator connectivity flags', () => {
    const isDeviceOffline = (onLine: boolean) => !onLine;
    expect(isDeviceOffline(true)).toBe(false);
    expect(isDeviceOffline(false)).toBe(true);
  });
});
