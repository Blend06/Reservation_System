"""Resolve Business from request when Host has no subdomain (e.g. API on localhost)."""
from api.models import Business


def get_tenant_from_request(request):
    """
    Resolve business from X-Subdomain header, JSON/body subdomain, or query param.
    Used for public booking against api.example.com or localhost:8000.
    """
    body_sub = None
    if hasattr(request, 'data') and request.data is not None:
        body_sub = request.data.get('subdomain')
    query_sub = None
    if hasattr(request, 'query_params'):
        query_sub = request.query_params.get('subdomain')
    elif hasattr(request, 'GET'):
        query_sub = request.GET.get('subdomain')

    subdomain = request.META.get('HTTP_X_SUBDOMAIN') or body_sub or query_sub
    if not subdomain:
        return None
    try:
        return Business.objects.get(subdomain=subdomain.strip().lower(), is_active=True)
    except (Business.DoesNotExist, Business.MultipleObjectsReturned):
        return None
