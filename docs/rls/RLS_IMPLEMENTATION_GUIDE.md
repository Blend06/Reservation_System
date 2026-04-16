# RLS Implementation Guide - Step by Step

## Important Notice

**Before proceeding**: Read `RLS_DECISION_GUIDE.md` to determine if RLS is right for your project.

**For this project**: RLS is **NOT recommended** based on current scale and requirements. This guide is provided for reference if circumstances change.

---

## Overview

This guide provides step-by-step instructions for implementing PostgreSQL Row Level Security (RLS) in the Fade District reservation system.

**Estimated Time**: 15-20 hours total
- Database setup: 3-4 hours
- Django integration: 5-6 hours
- Testing: 4-5 hours
- Documentation: 2-3 hours
- Debugging and refinement: 2-3 hours

**Prerequisites**:
- PostgreSQL 9.5 or higher (RLS feature introduced)
- Django 4.2+
- Understanding of PostgreSQL and Django ORM
- Backup of production database

---

## Phase 1: Planning and Preparation

### Step 1.1: Identify Tables Requiring RLS

**Tables that need RLS** (contain tenant-specific data):
- `api_reservation` - Reservations belong to businesses
- `api_staff` - Staff members belong to businesses
- `api_user` - Users belong to businesses (business owners)

**Tables that DON'T need RLS**:
- `api_business` - Super admin manages all businesses
- `django_session` - Session management
- `auth_*` tables - Django auth tables

**Decision criteria**:
- Does the table have a `business_id` foreign key?
- Should data be isolated per tenant?
- Do multiple user types access this table?

### Step 1.2: Define Access Policies

For each table, define who can access what:

#### api_reservation Table

| User Type | SELECT | INSERT | UPDATE | DELETE |
|-----------|--------|--------|--------|--------|
| Super Admin | All rows | All rows | All rows | All rows |
| Business Owner | Own business only | Own business only | Own business only | Own business only |
| Public | None | Via app only | None | None |

#### api_staff Table

| User Type | SELECT | INSERT | UPDATE | DELETE |
|-----------|--------|--------|--------|--------|
| Super Admin | All rows | All rows | All rows | All rows |
| Business Owner | Own business only | Own business only | Own business only | Own business only |
| Public | None | None | None | None |

#### api_user Table

| User Type | SELECT | INSERT | UPDATE | DELETE |
|-----------|--------|--------|--------|--------|
| Super Admin | All rows | All rows | All rows | All rows |
| Business Owner | Own record only | None | Own record only | None |
| Public | None | None | None | None |

### Step 1.3: Plan Session Variables

Session variables store context for RLS policies:

**Required variables**:
- `app.current_business_id` - UUID of current business
- `app.user_type` - Type of user (super_admin, business_owner, public)
- `app.user_id` - UUID of current user (optional, for user-specific policies)

**Variable naming convention**:
- Use `app.` prefix to avoid conflicts
- Use descriptive names
- Keep consistent across all policies

### Step 1.4: Backup Database

**Before making any changes**:

```bash
# Create full database backup
pg_dump -U postgres -d fade_district_db > backup_before_rls.sql

# Verify backup
ls -lh backup_before_rls.sql

# Test restore on a separate database (optional but recommended)
createdb fade_district_test
psql -U postgres -d fade_district_test < backup_before_rls.sql
```

---

## Phase 2: Database Setup

### Step 2.1: Create Database Functions

Create helper functions for setting tenant context.

**File**: Create a new migration file

**Purpose**: Functions to set and get session variables

**Steps**:

1. Create Django migration:
```bash
python manage.py makemigrations --empty api --name add_rls_functions
```

2. Edit the migration file to add SQL:

**Function 1: Set Tenant Context**
```sql
CREATE OR REPLACE FUNCTION set_tenant_context(
    p_business_id UUID,
    p_user_type TEXT,
    p_user_id UUID DEFAULT NULL
) RETURNS void AS $$
BEGIN
    -- Set business context
    PERFORM set_config('app.current_business_id', p_business_id::text, false);
    
    -- Set user type
    PERFORM set_config('app.user_type', p_user_type, false);
    
    -- Set user ID (optional)
    IF p_user_id IS NOT NULL THEN
        PERFORM set_config('app.user_id', p_user_id::text, false);
    END IF;
END;
$$ LANGUAGE plpgsql;
```

**Function 2: Clear Tenant Context**
```sql
CREATE OR REPLACE FUNCTION clear_tenant_context() RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_business_id', '', false);
    PERFORM set_config('app.user_type', '', false);
    PERFORM set_config('app.user_id', '', false);
END;
$$ LANGUAGE plpgsql;
```

**Function 3: Get Current Business ID**
```sql
CREATE OR REPLACE FUNCTION get_current_business_id() RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_business_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

### Step 2.2: Enable RLS on Tables

**File**: Create another migration

**Purpose**: Enable RLS on tenant-aware tables

**Steps**:

1. Create migration:
```bash
python manage.py makemigrations --empty api --name enable_rls_on_tables
```

2. Add SQL to enable RLS:

```sql
-- Enable RLS on api_reservation
ALTER TABLE api_reservation ENABLE ROW LEVEL SECURITY;

-- Enable RLS on api_staff
ALTER TABLE api_staff ENABLE ROW LEVEL SECURITY;

-- Enable RLS on api_user (optional, for user-specific access)
ALTER TABLE api_user ENABLE ROW LEVEL SECURITY;
```

**Important**: After enabling RLS, the table owner (postgres user) can still access all rows. Other users will see NO rows until policies are created.

### Step 2.3: Create RLS Policies

**File**: Create another migration

**Purpose**: Define access policies for each table

#### Policies for api_reservation Table

**Policy 1: Super Admin Full Access**
```sql
CREATE POLICY super_admin_all_access ON api_reservation
    FOR ALL
    TO PUBLIC
    USING (
        current_setting('app.user_type', true) = 'super_admin'
    );
```

**Policy 2: Business Owner Access**
```sql
CREATE POLICY business_owner_access ON api_reservation
    FOR ALL
    TO PUBLIC
    USING (
        current_setting('app.user_type', true) = 'business_owner'
        AND business_id::text = current_setting('app.current_business_id', true)
    );
```

**Policy 3: Public No Direct Access**
```sql
CREATE POLICY public_no_access ON api_reservation
    FOR SELECT
    TO PUBLIC
    USING (false);
```

#### Policies for api_staff Table

**Policy 1: Super Admin Full Access**
```sql
CREATE POLICY super_admin_all_access ON api_staff
    FOR ALL
    TO PUBLIC
    USING (
        current_setting('app.user_type', true) = 'super_admin'
    );
```

**Policy 2: Business Owner Access**
```sql
CREATE POLICY business_owner_access ON api_staff
    FOR ALL
    TO PUBLIC
    USING (
        current_setting('app.user_type', true) = 'business_owner'
        AND business_id::text = current_setting('app.current_business_id', true)
    );
```

#### Policies for api_user Table

**Policy 1: Super Admin Full Access**
```sql
CREATE POLICY super_admin_all_access ON api_user
    FOR ALL
    TO PUBLIC
    USING (
        current_setting('app.user_type', true) = 'super_admin'
    );
```

**Policy 2: Business Owner Own Record**
```sql
CREATE POLICY business_owner_own_record ON api_user
    FOR SELECT
    TO PUBLIC
    USING (
        current_setting('app.user_type', true) = 'business_owner'
        AND id::text = current_setting('app.user_id', true)
    );
```

### Step 2.4: Test Policies Manually

**Connect to database**:
```bash
psql -U postgres -d fade_district_db
```

**Test 1: No context set (should see no rows)**
```sql
SELECT COUNT(*) FROM api_reservation;
-- Expected: 0 rows (RLS blocks access)
```

**Test 2: Set super admin context**
```sql
SELECT set_tenant_context(
    'any-uuid'::UUID,
    'super_admin'
);

SELECT COUNT(*) FROM api_reservation;
-- Expected: All rows visible
```

**Test 3: Set business owner context**
```sql
-- Get a real business ID from database
SELECT id FROM api_business LIMIT 1;

-- Set context with that business ID
SELECT set_tenant_context(
    '<business-id-from-above>'::UUID,
    'business_owner'
);

SELECT COUNT(*) FROM api_reservation;
-- Expected: Only rows for that business
```

**Test 4: Clear context**
```sql
SELECT clear_tenant_context();

SELECT COUNT(*) FROM api_reservation;
-- Expected: 0 rows again
```

---

## Phase 3: Django Integration

### Step 3.1: Create Custom Database Backend

**File**: `backend/backend/db_backend.py`

**Purpose**: Custom PostgreSQL backend that sets RLS context

**Steps**:

1. Create the file
2. Extend Django's PostgreSQL backend
3. Override connection initialization

**Key points**:
- Set context when connection is established
- Get tenant and user from thread-local storage
- Handle cases where context is not available

### Step 3.2: Update Middleware

**File**: `backend/api/middleware.py`

**Purpose**: Set RLS context for each request

**Steps**:

1. Import database connection
2. After setting tenant in thread-local, set in database
3. Handle both authenticated and unauthenticated requests

**Key points**:
- Set context after tenant detection
- Set context after user authentication
- Clear context on request end (optional)
- Handle errors gracefully

### Step 3.3: Update Settings

**File**: `backend/backend/settings.py`

**Purpose**: Use custom database backend

**Steps**:

1. Change `ENGINE` in `DATABASES` setting
2. Point to custom backend
3. Keep all other database settings

**Before**:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        # ... other settings
    }
}
```

**After**:
```python
DATABASES = {
    'default': {
        'ENGINE': 'backend.db_backend.TenantAwarePostgreSQLBackend',
        # ... other settings
    }
}
```

### Step 3.4: Handle Connection Pooling

**Issue**: Connection pooling reuses connections, which may have stale RLS context

**Solutions**:

**Option 1: Set context on every query** (Recommended)
- Set context in middleware for each request
- Overhead: ~1-2ms per request

**Option 2: Disable connection pooling**
- Set `CONN_MAX_AGE = 0` in settings
- Overhead: ~10-20ms per request (new connection each time)

**Option 3: Reset context on connection reuse**
- Clear context when returning connection to pool
- More complex to implement

**Recommendation**: Use Option 1 for best balance

### Step 3.5: Update Management Commands

**Issue**: Management commands don't have request context

**Solution**: Set context manually in commands that access tenant data

**Example**: Update `create_superadmin` command

**Steps**:
1. Import database connection
2. Set super admin context before queries
3. Clear context after command completes

**Key points**:
- Super admin commands should set `user_type = 'super_admin'`
- Tenant-specific commands should set appropriate business_id
- Always clear context when done

---

## Phase 4: Testing

### Step 4.1: Create RLS Test Suite

**File**: `backend/scripts/tests/test_rls.py`

**Purpose**: Comprehensive tests for RLS policies

**Test categories**:

#### Test Category 1: Tenant Isolation

**Test**: Business owner cannot see other business data
```
1. Create two businesses (A and B)
2. Create reservations for each
3. Authenticate as business owner A
4. Query all reservations
5. Assert: Only business A reservations returned
```

**Test**: Business owner cannot update other business data
```
1. Create two businesses (A and B)
2. Create reservation for business B
3. Authenticate as business owner A
4. Try to update business B reservation
5. Assert: Update fails or returns 404
```

**Test**: Business owner cannot delete other business data
```
1. Create two businesses (A and B)
2. Create reservation for business B
3. Authenticate as business owner A
4. Try to delete business B reservation
5. Assert: Delete fails or returns 404
```

#### Test Category 2: Super Admin Access

**Test**: Super admin can see all data
```
1. Create multiple businesses
2. Create reservations for each
3. Authenticate as super admin
4. Query all reservations
5. Assert: All reservations returned
```

**Test**: Super admin can update any data
```
1. Create reservation for any business
2. Authenticate as super admin
3. Update the reservation
4. Assert: Update succeeds
```

#### Test Category 3: Public Access

**Test**: Unauthenticated users cannot query directly
```
1. Create reservations
2. Do NOT authenticate
3. Try to query reservations directly (bypass views)
4. Assert: No rows returned or error
```

#### Test Category 4: Edge Cases

**Test**: Missing context returns no data
```
1. Create reservations
2. Clear RLS context
3. Query reservations
4. Assert: No rows returned
```

**Test**: Invalid business ID returns no data
```
1. Create reservations
2. Set context with non-existent business ID
3. Query reservations
4. Assert: No rows returned
```

**Test**: Context persists across queries
```
1. Set business owner context
2. Query reservations (should see own data)
3. Query staff (should see own data)
4. Assert: Both queries filtered correctly
```

### Step 4.2: Run Existing Tests

**Purpose**: Ensure RLS doesn't break existing functionality

**Steps**:

1. Run full test suite:
```bash
python manage.py test
```

2. Check for failures related to:
   - Missing RLS context in tests
   - Tests expecting all data but getting filtered data
   - Tests that bypass views and query directly

3. Fix failing tests by:
   - Setting appropriate RLS context in test setup
   - Using super admin context for tests that need all data
   - Updating assertions to match filtered results

### Step 4.3: Manual Testing

**Test Scenario 1: Business Owner Login**

1. Log in as business owner
2. Navigate to reservations page
3. Verify: Only own business reservations shown
4. Try to access another business's reservation by URL
5. Verify: 404 or permission denied

**Test Scenario 2: Super Admin Login**

1. Log in as super admin
2. Navigate to all reservations
3. Verify: All businesses' reservations shown
4. Filter by business
5. Verify: Filtering works correctly

**Test Scenario 3: Public Booking**

1. Open public booking page (no login)
2. Submit a reservation
3. Verify: Reservation created successfully
4. Verify: Reservation assigned to correct business

**Test Scenario 4: API Endpoints**

1. Test each API endpoint with different user types
2. Verify: Responses match expected access levels
3. Test with invalid tokens
4. Verify: Proper error handling

### Step 4.4: Performance Testing

**Purpose**: Measure RLS overhead

**Metrics to track**:
- Query execution time (before and after RLS)
- Request response time
- Database CPU usage
- Connection pool utilization

**Tools**:
- Django Debug Toolbar
- PostgreSQL `EXPLAIN ANALYZE`
- Application Performance Monitoring (APM)

**Benchmarks**:

**Test 1: Simple SELECT query**
```sql
-- Without RLS
EXPLAIN ANALYZE SELECT * FROM api_reservation WHERE business_id = 'xxx';

-- With RLS
SELECT set_tenant_context('xxx'::UUID, 'business_owner');
EXPLAIN ANALYZE SELECT * FROM api_reservation;
```

**Expected overhead**: 1-3ms per query

**Test 2: Complex JOIN query**
```sql
-- Test queries with multiple tables
-- Measure overhead with RLS policies on all tables
```

**Expected overhead**: 2-5ms per query

**Test 3: API endpoint response time**
```bash
# Use Apache Bench or similar tool
ab -n 1000 -c 10 http://localhost:8000/api/reservations/
```

**Expected overhead**: 5-10ms per request

**Acceptable thresholds**:
- Query overhead < 5ms: Good
- Query overhead 5-10ms: Acceptable
- Query overhead > 10ms: Investigate and optimize

---

## Phase 5: Deployment

### Step 5.1: Staging Deployment

**Purpose**: Test RLS in production-like environment

**Steps**:

1. Deploy to staging environment
2. Run full test suite on staging
3. Perform manual testing
4. Monitor performance for 24-48 hours
5. Check error logs for RLS-related issues

**Checklist**:
- [ ] All migrations applied successfully
- [ ] RLS policies created correctly
- [ ] Application sets context properly
- [ ] No unexpected errors in logs
- [ ] Performance within acceptable range
- [ ] All user types can access appropriate data

### Step 5.2: Production Deployment

**Purpose**: Roll out RLS to production

**Pre-deployment**:
- [ ] Full database backup
- [ ] Rollback plan documented
- [ ] Team notified of deployment
- [ ] Monitoring alerts configured

**Deployment steps**:

1. **Maintenance window** (recommended):
   - Put application in maintenance mode
   - Prevents data inconsistencies during migration

2. **Apply migrations**:
```bash
python manage.py migrate
```

3. **Verify RLS enabled**:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('api_reservation', 'api_staff', 'api_user');
```

4. **Verify policies created**:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('api_reservation', 'api_staff', 'api_user');
```

5. **Test with real users**:
   - Super admin login and access
   - Business owner login and access
   - Public booking

6. **Monitor for issues**:
   - Check error logs
   - Monitor query performance
   - Watch for access denied errors

7. **Exit maintenance mode**

**Post-deployment**:
- [ ] Verify all functionality works
- [ ] Monitor performance for 24 hours
- [ ] Check error rates
- [ ] Gather user feedback

### Step 5.3: Rollback Plan

**If issues occur**, follow this rollback procedure:

**Step 1: Disable RLS (Quick fix)**
```sql
-- Temporarily disable RLS on tables
ALTER TABLE api_reservation DISABLE ROW LEVEL SECURITY;
ALTER TABLE api_staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE api_user DISABLE ROW LEVEL SECURITY;
```

**Step 2: Revert migrations (Full rollback)**
```bash
# Identify migration to revert to
python manage.py showmigrations api

# Revert to migration before RLS
python manage.py migrate api <migration_name>
```

**Step 3: Restore from backup (Last resort)**
```bash
# Stop application
# Restore database
psql -U postgres -d fade_district_db < backup_before_rls.sql
# Restart application
```

---

## Phase 6: Monitoring and Maintenance

### Step 6.1: Set Up Monitoring

**Metrics to monitor**:

1. **Query Performance**
   - Average query execution time
   - Slow query log (queries > 100ms)
   - Query count per endpoint

2. **Error Rates**
   - RLS policy violations
   - Missing context errors
   - Permission denied errors

3. **Database Health**
   - Connection pool utilization
   - Database CPU usage
   - Lock contention

**Tools**:
- Django Debug Toolbar (development)
- PostgreSQL pg_stat_statements
- Application Performance Monitoring (APM)
- Error tracking (Sentry, Rollbar)

### Step 6.2: Create Alerts

**Alert conditions**:

1. **High error rate**: > 1% of requests fail with RLS errors
2. **Slow queries**: > 10% of queries take > 100ms
3. **Missing context**: Any query without RLS context set
4. **Policy violations**: Attempts to access unauthorized data

**Alert channels**:
- Email to development team
- Slack notifications
- PagerDuty for critical issues

### Step 6.3: Regular Maintenance

**Weekly tasks**:
- Review slow query log
- Check error logs for RLS issues
- Monitor query performance trends

**Monthly tasks**:
- Review and optimize RLS policies
- Update documentation
- Audit access patterns
- Performance tuning

**Quarterly tasks**:
- Security audit of RLS policies
- Review and update policies for new tables
- Team training on RLS best practices

### Step 6.4: Troubleshooting Guide

**Issue 1: No data returned when expected**

**Symptoms**: Queries return empty results

**Causes**:
- RLS context not set
- Wrong business_id in context
- User type not set correctly

**Solution**:
1. Check if context is set: `SELECT current_setting('app.current_business_id', true);`
2. Verify business_id matches data: `SELECT business_id FROM api_reservation LIMIT 1;`
3. Check user type: `SELECT current_setting('app.user_type', true);`

**Issue 2: Slow query performance**

**Symptoms**: Queries take longer than expected

**Causes**:
- RLS policy not using indexes
- Complex policy conditions
- Missing indexes on business_id

**Solution**:
1. Run `EXPLAIN ANALYZE` on slow queries
2. Add indexes on columns used in RLS policies
3. Simplify policy conditions
4. Consider caching frequently accessed data

**Issue 3: Permission denied errors**

**Symptoms**: Users get "permission denied" errors

**Causes**:
- RLS policy too restrictive
- Context not set for user type
- Policy missing for operation (INSERT, UPDATE, DELETE)

**Solution**:
1. Review policy for affected table
2. Check if policy covers all operations (SELECT, INSERT, UPDATE, DELETE)
3. Verify context is set correctly for user type

**Issue 4: Context not persisting**

**Symptoms**: Context works for first query but not subsequent ones

**Causes**:
- Connection pooling reusing connections
- Context cleared between queries
- Transaction rollback clearing context

**Solution**:
1. Set context on every request in middleware
2. Don't rely on context persisting across requests
3. Use `false` parameter in `set_config` to persist within transaction

---

## Phase 7: Documentation

### Step 7.1: Update Architecture Documentation

**File**: `docs/architecture/MULTI_TENANT_SAAS_DOCUMENTATION.md`

**Add section**: "Database-Level Security with RLS"

**Content**:
- Overview of RLS implementation
- Tables with RLS enabled
- Policy descriptions
- How context is set

### Step 7.2: Update Security Documentation

**File**: `docs/security/SECURITY_IMPLEMENTATION.md`

**Add section**: "Row Level Security"

**Content**:
- RLS as additional security layer
- How RLS complements application security
- Testing RLS policies

### Step 7.3: Create Developer Guide

**File**: `docs/rls/RLS_DEVELOPER_GUIDE.md`

**Content**:
- How to work with RLS in development
- How to write tests with RLS
- How to add RLS to new tables
- Troubleshooting common issues

### Step 7.4: Update README

**File**: `README.md`

**Add to security section**:
- Mention RLS as security feature
- Link to RLS documentation

---

## Checklist: Implementation Complete

Use this checklist to verify RLS is fully implemented:

### Database Setup
- [ ] Helper functions created (set_tenant_context, clear_tenant_context)
- [ ] RLS enabled on all tenant-aware tables
- [ ] Policies created for all user types
- [ ] Policies tested manually in psql

### Django Integration
- [ ] Custom database backend created
- [ ] Middleware updated to set RLS context
- [ ] Settings updated to use custom backend
- [ ] Management commands updated

### Testing
- [ ] RLS test suite created and passing
- [ ] Existing tests updated and passing
- [ ] Manual testing completed
- [ ] Performance testing completed

### Deployment
- [ ] Staging deployment successful
- [ ] Production deployment successful
- [ ] Rollback plan documented and tested
- [ ] Monitoring configured

### Documentation
- [ ] Architecture documentation updated
- [ ] Security documentation updated
- [ ] Developer guide created
- [ ] README updated

### Maintenance
- [ ] Monitoring alerts configured
- [ ] Maintenance schedule established
- [ ] Team trained on RLS
- [ ] Troubleshooting guide created

---

## Conclusion

Implementing RLS is a significant undertaking that adds complexity to your system. This guide provides a comprehensive roadmap, but remember:

**RLS is not always necessary**. For this project (5-50 clients, strong application security), RLS may be overkill.

**If you do implement RLS**:
- Follow this guide step by step
- Test thoroughly at each phase
- Monitor performance closely
- Document everything
- Train your team

**If you skip RLS**:
- Focus on application-level security
- Write comprehensive tests
- Implement audit logging
- Monitor access patterns

Either way, security is a journey, not a destination. Keep improving, keep testing, and keep your users' data safe.

---

**Last Updated**: 2024  
**Project**: Fade District Multi-Tenant SaaS  
**Estimated Implementation Time**: 15-20 hours  
**Recommended**: NO (for current scale)
