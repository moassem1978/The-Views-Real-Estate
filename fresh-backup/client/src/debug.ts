// Debug utility for consistent logging
export const DEBUG = {
  log: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[DEBUG][${timestamp}] ${message}`, data !== undefined ? data : '');
  },
  
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR][${timestamp}] ${message}`, error || '');
  },
  
  warn: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN][${timestamp}] ${message}`, data !== undefined ? data : '');
  },

  // Creates formatted JSON string for logging
  formatJSON: (data: any): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return `[Could not stringify: ${e}]`;
    }
  }
};