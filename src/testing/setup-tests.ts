import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import '@/lib/i18n';

// Standard JSDOM polyfills for Radix UI primitives
if (typeof window !== 'undefined') {
  if (!window.PointerEvent) {
    class PointerEvent extends MouseEvent {
      pointerId: number;
      constructor(type: string, params: PointerEventInit = {}) {
        super(type, params);
        this.pointerId = params.pointerId || 0;
      }
    }
    window.PointerEvent = PointerEvent as any;
  }
  window.HTMLElement.prototype.hasPointerCapture = () => false;
  window.HTMLElement.prototype.setPointerCapture = () => {};
  window.HTMLElement.prototype.releasePointerCapture = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
}
