// Legacy bridge: re-export shared sanitization helpers during cleanup.
export {
  SanitizedHTML,
  sanitizeEmail,
  sanitizeFilename,
  sanitizeHTML,
  sanitizeInput,
  sanitizeJSON,
  sanitizeURL,
  useSanitizedInput,
  type SanitizedHTMLProps,
} from '@shared/utils/sanitization';
