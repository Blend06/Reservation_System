"""
Security middleware for adding security headers and basic request validation.
"""
from django.utils.deprecation import MiddlewareMixin
import logging

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Add security headers to all responses to prevent XSS, clickjacking, etc.
    """
    
    def process_response(self, request, response):
        """Add security headers to response"""
        
        # Prevent MIME type sniffing
        response['X-Content-Type-Options'] = 'nosniff'
        
        # Prevent clickjacking attacks
        response['X-Frame-Options'] = 'DENY'
        
        # Enable XSS filter in browsers (legacy, but doesn't hurt)
        response['X-XSS-Protection'] = '1; mode=block'
        
        # Control referrer information
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Content Security Policy (CSP)
        # Adjust based on your needs - this is a balanced policy
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  # React needs unsafe-inline/eval
            "style-src 'self' 'unsafe-inline'",  # Tailwind needs unsafe-inline
            "img-src 'self' data: https:",  # Allow images from anywhere (for user uploads)
            "font-src 'self' data:",
            "connect-src 'self'",  # API calls to same origin
            "frame-ancestors 'none'",  # Prevent embedding
        ]
        response['Content-Security-Policy'] = "; ".join(csp_directives)
        
        return response
