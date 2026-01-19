from django.http import Http404
from django.utils.deprecation import MiddlewareMixin
from api.models import Business
import threading

# Thread-local storage for current tenant
_thread_locals = threading.local()

class TenantMiddleware(MiddlewareMixin):
    """
    Middleware to detect subdomain and set current tenant context
    """
    
    def process_request(self, request):
        # Get the host from the request
        host = request.get_host().lower()
        
        # Extract subdomain
        subdomain = self.get_subdomain(host)
        
        if subdomain:
            try:
                # Find business by subdomain
                business = Business.objects.get(subdomain=subdomain, is_active=True)
                request.tenant = business
                set_current_tenant(business)
            except Business.DoesNotExist:
                # Subdomain doesn't exist or business is inactive
                raise Http404("Business not found")
        else:
            # Main domain - no tenant context
            request.tenant = None
            set_current_tenant(None)
    
    def get_subdomain(self, host):
        """
        Extract subdomain from host
        Examples:
        - salon.yourdomain.com -> salon
        - yourdomain.com -> None
        - localhost:3000 -> None
        """
        # Remove port if present
        host = host.split(':')[0]
        
        # Split by dots
        parts = host.split('.')
        
        # If we have at least 3 parts (subdomain.domain.tld), return first part
        if len(parts) >= 3:
            return parts[0]
        
        # For localhost or single domain, no subdomain
        return None

def get_current_tenant():
    """Get the current tenant from thread-local storage"""
    return getattr(_thread_locals, 'tenant', None)

def set_current_tenant(tenant):
    """Set the current tenant in thread-local storage"""
    _thread_locals.tenant = tenant