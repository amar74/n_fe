/**
 * Clipboard utility that works on both HTTP and HTTPS
 * Falls back to document.execCommand for HTTP contexts
 */

export async function copyToClipboard(text: string): Promise<void> {
  // Try modern Clipboard API first (HTTPS/localhost only)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (err) {
      console.warn('Clipboard API failed, falling back to execCommand:', err);
    }
  }

  // Fallback for HTTP contexts
  return fallbackCopyToClipboard(text);
}

/**
 * Fallback method using deprecated execCommand
 * Works on HTTP but will be removed in future browsers
 */
function fallbackCopyToClipboard(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make it invisible
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        resolve();
      } else {
        reject(new Error('Copy command failed'));
      }
    } catch (err) {
      document.body.removeChild(textArea);
      reject(err);
    }
  });
}

/**
 * Check if clipboard API is available
 */
export function isClipboardAvailable(): boolean {
  return !!(navigator.clipboard && window.isSecureContext);
}
