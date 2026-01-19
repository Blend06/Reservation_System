from django.db import models
from .middleware import get_current_tenant

class TenantAwareManager(models.Manager):
    """
    Manager that automatically filters queries by current tenant
    """
    
    def get_queryset(self):
        queryset = super().get_queryset()
        tenant = get_current_tenant()
        
        if tenant and hasattr(self.model, 'business'):
            # Filter by current tenant
            return queryset.filter(business=tenant)
        
        return queryset
    
    def all_tenants(self):
        """Get queryset for all tenants (bypass tenant filtering)"""
        return super().get_queryset()

class BusinessManager(models.Manager):
    """
    Manager for Business model - no tenant filtering needed
    """
    pass