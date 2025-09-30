export function setupKeyboardNavigation() {
  if (typeof window === 'undefined') return;

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'n':
          e.preventDefault();
          const addCardButton = document.querySelector('[data-action="add-card"]') as HTMLButtonElement;
          addCardButton?.click();
          break;
        case 'Enter':
          e.preventDefault();
          const submitButton = document.querySelector('[data-action="submit"]') as HTMLButtonElement;
          submitButton?.click();
          break;
        case 'k':
          e.preventDefault();
          const apiKeyButton = document.querySelector('[data-action="open-settings"]') as HTMLButtonElement;
          apiKeyButton?.click();
          break;
      }
    }

    if (e.key === 'Escape') {
      const closeButtons = document.querySelectorAll('[data-action="close-modal"]');
      const lastCloseButton = closeButtons[closeButtons.length - 1] as HTMLButtonElement;
      lastCloseButton?.click();
    }
  });
}

export function trapFocusInModal(modalElement: HTMLElement) {
  const focusableElements = modalElement.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  modalElement.addEventListener('keydown', handleTabKey);
  firstFocusable?.focus();

  return () => {
    modalElement.removeEventListener('keydown', handleTabKey);
  };
}

export function generateImageAltText(analysis?: string, imageName?: string): string {
  if (analysis) {
    const summary = analysis.split('\n')[0].slice(0, 150);
    return summary.endsWith('.') ? summary : `${summary}...`;
  }
  return imageName ? `Uploaded image: ${imageName}` : 'Uploaded image for AI analysis';
}

export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof window === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

export function getHighContrastMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
}

export function getReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}