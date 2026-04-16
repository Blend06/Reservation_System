# Row Level Security (RLS) Overview

## What is Row Level Security?

Row Level Security (RLS) is a PostgreSQL database feature that allows you to control which rows users can access in a table. Instead of relying solely on application code to filter data, RLS enforces access control at the database level.

## How RLS Works

### Traditional Application-Level Security

```
User Request → Application Code → Filter by business_id → Database Query
```

In traditional multi-tenant applications:
1. User makes a request
2. Application code determines which business they belong to
3. Application adds `WHERE business_id = 'xxx'` to queries
4. Database returns filtered results

**Problem:** If application code has a bug or is bypassed, users might access other tenants' data.

### Database-Level RLS

```
User Request → Application Code → Database Query → RLS Policy Check → Filtered Results
```

With RLS enabled:
1. User makes a request
2. Application sets database session variables (tenant context)
3. Application sends query to database
4. **Database enforces RLS policies automatically**
5. Only authorized rows are returned

**Benefit:** Even if application code forgets to filter, the database blocks unauthorized access.

## Key Concepts

### 1. RLS Policies

Policies are rules that define who can access which rows. Example:

```
Policy: "Business owners can only see their own business data"
Rule: WHERE business_id = current_setting('app.current_business_id')
```

### 2. Session Variables

The application sets context variables that policies use:

```
SET app.current_business_id = 'uuid-of-business';
SET app.user_type = 'business_owner';
```

### 3. Policy Types

- **PERMISSIVE policies**: Allow access if condition is true (OR logic)
- **RESTRICTIVE policies**: Block access unless condition is true (AND logic)
- **Command-specific**: Different policies for SELECT, INSERT, UPDATE, DELETE

### 4. Bypass Options

- **Superusers**: PostgreSQL superusers bypass RLS by default
- **BYPASSRLS role**: Specific roles can be granted RLS bypass
- **Force RLS**: Can force RLS even for table owners

## RLS in Multi-Tenant Applications

### Tenant Isolation

In a multi-tenant SaaS (like this reservation system):

- **Tenant**: Each business is a separate tenant
- **Isolation**: Business A cannot see Business B's data
- **Shared Database**: All tenants share the same database tables

### How RLS Enforces Isolation

1. **Enable RLS on tables**:
   - `api_reservation` table gets RLS enabled
   - `api_staff` table gets RLS enabled
   - `api_business` table might not need RLS (super admin only)

2. **Create policies**:
   - Super admins see all data
   - Business owners see only their business data
   - Public users see no data (must go through application)

3. **Set context per request**:
   - Middleware detects which business (from subdomain)
   - Sets `app.current_business_id` in database session
   - All queries automatically filtered by RLS

## Real-World Example

### Without RLS (Application-Level Only)

**Scenario**: Developer writes a new API endpoint and forgets to filter by business.

```
# Bug in code - missing business filter!
def get_all_reservations(request):
    return Reservation.objects.all()  # OOPS! Returns ALL businesses' data
```

**Result**: Business A can see Business B's reservations. **Data breach!**

### With RLS (Database-Level Protection)

**Same scenario**: Developer makes the same mistake.

```
# Same bug in code
def get_all_reservations(request):
    return Reservation.objects.all()  # Still missing filter
```

**Result**: Database RLS policy blocks cross-tenant access. Business A only sees their own data. **No breach!**

## RLS vs Application-Level Security

### Application-Level Security (Current System)

**How it works:**
- Django views filter queries: `Reservation.objects.filter(business=tenant)`
- Middleware sets tenant context
- Permissions check user type

**Strengths:**
- Simple to understand
- Easy to debug
- No database overhead
- Works with any database

**Weaknesses:**
- Relies on developers remembering to filter
- Vulnerable to code bugs
- No protection if ORM is bypassed
- Third-party packages might not filter correctly

### Database-Level RLS

**How it works:**
- PostgreSQL enforces policies on every query
- Application sets session variables
- Database automatically filters rows

**Strengths:**
- Defense in depth (extra security layer)
- Protects against application bugs
- Blocks ORM bypass attempts
- Safe for direct database access (analysts, BI tools)

**Weaknesses:**
- More complex to implement
- Harder to debug
- Performance overhead (1-5ms per query)
- PostgreSQL-specific (not portable)

## When to Use RLS

### ✅ Use RLS When:

1. **High-value data**: Financial, healthcare, or sensitive personal data
2. **Regulatory compliance**: HIPAA, SOC 2, GDPR requirements
3. **Large scale**: Hundreds or thousands of tenants
4. **Multiple access points**: Direct database access by analysts, BI tools
5. **Enterprise clients**: Customers require database-level security
6. **High-risk environment**: History of security incidents
7. **Complex team**: Many developers, contractors, or third parties

### ❌ Skip RLS When:

1. **Small scale**: 5-50 tenants (like this project)
2. **Controlled access**: Single team, no direct database access
3. **Strong app security**: Robust application-level filtering already in place
4. **Limited resources**: Small team with limited time
5. **Simple use case**: Low-risk data, no compliance requirements
6. **Development speed priority**: Need to move fast, iterate quickly

## RLS Performance Considerations

### Performance Impact

- **Query overhead**: 1-5ms per query (policy evaluation)
- **Connection overhead**: Setting session variables on each connection
- **Index usage**: RLS policies can affect query optimization
- **Planning overhead**: PostgreSQL must plan queries with policies

### Optimization Strategies

1. **Keep policies simple**: Complex policies slow down queries
2. **Use indexes**: Index columns used in RLS policies
3. **Connection pooling**: Reuse connections to avoid setup overhead
4. **Monitor performance**: Track query times before and after RLS

## Security Layers Comparison

### Current System (Without RLS)

```
Layer 1: Frontend Route Guards
Layer 2: JWT Authentication
Layer 3: Middleware Tenant Detection
Layer 4: View-Level Permissions
Layer 5: QuerySet Filtering
Layer 6: Foreign Key Constraints
Layer 7: XSS Protection
Layer 8: Django ORM (SQL Injection Protection)
```

### With RLS Added

```
Layer 1: Frontend Route Guards
Layer 2: JWT Authentication
Layer 3: Middleware Tenant Detection
Layer 4: View-Level Permissions
Layer 5: QuerySet Filtering
Layer 6: Foreign Key Constraints
Layer 7: XSS Protection
Layer 8: Django ORM (SQL Injection Protection)
Layer 9: PostgreSQL RLS Policies ← NEW
```

## Common RLS Patterns

### Pattern 1: Tenant Isolation

**Use case**: Multi-tenant SaaS with complete data isolation

**Policy**: Users can only access rows where `business_id` matches their tenant

**Example**: Reservation system, project management tools, CRM systems

### Pattern 2: Hierarchical Access

**Use case**: Organization with departments and teams

**Policy**: Users can access their data + subordinate data

**Example**: Company with managers seeing team data

### Pattern 3: Role-Based Access

**Use case**: Different user types with different permissions

**Policy**: Admins see all, managers see department, users see own

**Example**: HR system, document management

### Pattern 4: Attribute-Based Access

**Use case**: Access based on data attributes

**Policy**: Users can access rows where `status = 'public'` or `owner_id = user_id`

**Example**: Document sharing, social media posts

## RLS Limitations

### What RLS Cannot Do

1. **Application logic**: RLS cannot replace business logic
2. **Cross-table joins**: Complex joins may bypass RLS
3. **Aggregate queries**: COUNT(*) might reveal data existence
4. **Performance guarantees**: RLS adds overhead
5. **Audit logging**: RLS doesn't log access attempts

### What RLS Should Not Replace

1. **Authentication**: Still need to verify user identity
2. **Authorization**: Still need role-based access control
3. **Input validation**: Still need to sanitize inputs
4. **Business rules**: Still need application-level validation

## RLS Best Practices

### 1. Defense in Depth

Don't rely solely on RLS. Use it as an additional layer:
- Keep application-level filtering
- Maintain permission checks
- Continue input validation

### 2. Test Thoroughly

- Test each policy with different user types
- Test edge cases (null values, missing context)
- Test performance impact
- Test with production-like data volume

### 3. Monitor and Audit

- Log RLS policy violations
- Monitor query performance
- Track which policies are triggered
- Regular security audits

### 4. Document Everything

- Document each policy's purpose
- Document session variables used
- Document bypass scenarios
- Document troubleshooting steps

### 5. Keep Policies Simple

- Simple policies are faster
- Simple policies are easier to debug
- Simple policies are easier to maintain
- Complex logic belongs in application code

## Conclusion

Row Level Security is a powerful database feature that adds an extra layer of security to multi-tenant applications. It protects against application bugs and provides defense in depth.

However, RLS is not always necessary. For small-scale applications with strong application-level security (like this reservation system), RLS may be overkill.

**Key Takeaway**: RLS is a tool, not a requirement. Evaluate your specific needs, scale, and risk profile before implementing it.

## Next Steps

- Read `RLS_DECISION_GUIDE.md` to determine if you need RLS
- Read `RLS_IMPLEMENTATION_GUIDE.md` for step-by-step implementation

## References

- PostgreSQL RLS Documentation: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- Multi-Tenant Data Architecture: https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/
- OWASP Multi-Tenancy Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Multitenant_Architecture_Cheat_Sheet.html

---

**Last Updated**: 2024  
**Project**: Fade District Multi-Tenant SaaS  
**PostgreSQL Version**: 15+
