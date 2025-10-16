/**
 * CloudFront Function for URL Rewriting
 *
 * This function handles SPA routing by rewriting URLs to index.html
 * while preserving the original URL for client-side routing
 *
 * Deploy this as a CloudFront Function and attach it to the Viewer Request event
 */

function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Check if the URI is missing a file extension (likely a SPA route)
  if (!uri.includes('.') && !uri.endsWith('/')) {
    // Rewrite to index.html
    request.uri = '/index.html';
  }
  // Handle root path
  else if (uri === '/' || uri === '') {
    request.uri = '/index.html';
  }
  // Handle directory paths
  else if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  }

  // Add security headers
  if (!request.headers) {
    request.headers = {};
  }

  return request;
}

// Export for CloudFront (Node.js environment)
if (typeof exports !== 'undefined') {
  exports.handler = handler;
}
