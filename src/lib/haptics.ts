export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'warning' = 'light') => {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;
  try {
    switch (type) {
      case 'light':   navigator.vibrate(8); break;           // Keypad digit tap
      case 'medium':  navigator.vibrate(15); break;          // Category chip select
      case 'heavy':   navigator.vibrate(30); break;          // Expense log success
      case 'warning': navigator.vibrate([25, 50, 25]); break; // Budget >85% alert
    }
  } catch (e) { /* Gracefully ignore unsupported desktop browsers */ }
};
