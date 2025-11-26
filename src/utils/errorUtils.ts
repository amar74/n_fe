/**
 * Utility functions for handling and formatting errors
 */

/**
 * Extracts a readable error message from various error formats
 * Handles:
 * - String errors
 * - Error objects with message
 * - Axios errors with response.data.detail
 * - Pydantic validation errors (array of {type, loc, msg, input, ctx})
 * - Generic objects
 */
export const extractErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  
  // If it's already a string, return it
  if (typeof error === 'string') return error;
  
  // Check for response data (Axios errors)
  const detail = error.response?.data?.detail;
  if (detail) {
    // If detail is a string, return it
    if (typeof detail === 'string') return detail;
    
    // If detail is an array (validation errors), format them
    if (Array.isArray(detail)) {
      return detail.map((err: any) => {
        if (typeof err === 'string') return err;
        if (err.msg) {
          const loc = err.loc ? err.loc.join('.') : '';
          return loc ? `${loc}: ${err.msg}` : err.msg;
        }
        return JSON.stringify(err);
      }).join(', ');
    }
    
    // If detail is an object, try to extract message
    if (typeof detail === 'object') {
      return detail.msg || detail.message || JSON.stringify(detail);
    }
  }
  
  // Check for direct message property
  if (error.message) return error.message;
  
  // Fallback to string representation
  return String(error) || 'An unknown error occurred';
};

