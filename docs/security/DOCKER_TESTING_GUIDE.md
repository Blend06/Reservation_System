# Docker Testing Guide - Security Implementation

This guide explains how to test the security implementation using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose available
- Project cloned locally

## Quick Start

### 1. Build the Container

```bash
docker-compose build backend
```

**What this does:**
- Builds a Python 3.12-slim container
- Installs all dependencies from `requirements.txt` including `bleach==6.1.0`
- Copies your application code
- Takes ~2-3 minutes on first build

### 2. Verify Bleach Installation

```bash
docker-compose run --rm backend python -c "import bleach; print('✅ Bleach version:', bleach.__version__)"
```

**Expected output:**
```
✅ Bleach version: 6.1.0
```

### 3. Run Security Tests

```bash
docker-compose run --rm backend python test_security_docker.py
```

**Expected output:**
```
============================================================
🔐 SECURITY TESTS - Docker Environment
============================================================

✅ Bleach installed: version 6.1.0

🔒 Testing XSS Protection...
  ✅ PASS: (5/5 tests)

📞 Testing Phone Validation...
  ✅ PASS: (5/5 tests)

📧 Testing Email Validation...
  ✅ PASS: (4/4 tests)

👤 Testing Name Validation...
  ✅ PASS: (5/5 tests)

============================================================
📊 TEST SUMMARY
============================================================
  ✅ PASS: XSS Protection
  ✅ PASS: Phone Validation
  ✅ PASS: Email Validation
  ✅ PASS: Name Validation

  Total: 4/4 test suites passed

🎉 All security tests passed!
```

## Detailed Testing

### Test Individual Components

#### Test XSS Sanitization

```bash
docker-compose run --rm backend python -c "
from api.utils.input_sanitizer import InputSanitizer
result = InputSanitizer.sanitize_text('<script>alert(XSS)</script>Hello')
print('Result:', result)
"
```

**Expected:** `Result: alert(XSS)Hello` (tags removed, text preserved)

#### Test Phone Validation

```bash
docker-compose run --rm backend python -c "
from api.utils.input_sanitizer import InputSanitizer
result = InputSanitizer.sanitize_phone('(123) 456-7890')
print('Result:', result)
"
```

**Expected:** `Result: 1234567890` (formatted and normalized)

#### Test Email Validation

```bash
docker-compose run --rm backend python -c "
from api.utils.input_sanitizer import InputSanitizer
result = InputSanitizer.sanitize_email('User@Example.COM')
print('Result:', result)
"
```

**Expected:** `Result: user@example.com` (lowercased)

#### Test Name Validation

```bash
docker-compose run --rm backend python -c "
from api.utils.input_sanitizer import InputSanitizer
result = InputSanitizer.sanitize_name('John Doe')
print('Result:', result)
"
```

**Expected:** `Result: John Doe`

### Test Invalid Inputs

#### Test Invalid Phone (Should Fail)

```bash
docker-compose run --rm backend python -c "
from api.utils.input_sanitizer import InputSanitizer
from django.core.exceptions import ValidationError
try:
    result = InputSanitizer.sanitize_phone('abc123')
    print('ERROR: Should have failed')
except ValidationError as e:
    print('✅ Correctly rejected:', str(e))
"
```

#### Test Invalid Email (Should Fail)

```bash
docker-compose run --rm backend python -c "
from api.utils.input_sanitizer import InputSanitizer
from django.core.exceptions import ValidationError
try:
    result = InputSanitizer.sanitize_email('notanemail')
    print('ERROR: Should have failed')
except ValidationError as e:
    print('✅ Correctly rejected:', str(e))
"
```

## Running the Full Application

### Start All Services

```bash
docker-compose up
```

This starts:
- PostgreSQL database (port 5432)
- Django backend (port 8000)
- React frontend (port 3000)

### Test API Endpoints

#### Test XSS Protection on Reservation Creation

```bash
curl -X POST http://localhost:8000/api/reservations/ \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "<script>alert(XSS)</script>John Doe",
    "customer_phone": "+1234567890",
    "notes": "<img src=x onerror=alert(XSS)>Please call me",
    "start_time": "2024-12-01T10:00:00Z",
    "end_time": "2024-12-01T11:00:00Z"
  }'
```

**Expected:** Name sanitized to "John Doe", notes sanitized to "Please call me"

## Troubleshooting

### Issue: Docker not running

**Error:**
```
error during connect: ... The system cannot find the file specified.
```

**Solution:** Start Docker Desktop

### Issue: Container build fails

**Error:**
```
ERROR: failed to solve: ...
```

**Solution:**
```bash
# Clean and rebuild
docker-compose down
docker system prune -f
docker-compose build --no-cache backend
```

### Issue: Tests fail

**Solution:**
```bash
# Check if bleach is installed
docker-compose run --rm backend pip list | grep bleach

# Rebuild if needed
docker-compose build backend

# Run tests again
docker-compose run --rm backend python test_security_docker.py
```

### Issue: Permission errors

**Solution (Windows):**
```bash
# Run as administrator or check Docker Desktop settings
```

**Solution (Linux/Mac):**
```bash
sudo docker-compose run --rm backend python test_security_docker.py
```

## Docker Commands Reference

### Build Commands

```bash
# Build backend only
docker-compose build backend

# Build all services
docker-compose build

# Build without cache (clean build)
docker-compose build --no-cache backend
```

### Run Commands

```bash
# Run security tests
docker-compose run --rm backend python test_security_docker.py

# Run Django tests
docker-compose run --rm backend python manage.py test

# Run specific test file
docker-compose run --rm backend python scripts/tests/test_security.py

# Run Python command
docker-compose run --rm backend python -c "import bleach; print(bleach.__version__)"

# Start interactive shell
docker-compose run --rm backend bash
```

### Service Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs backend

# Follow logs
docker-compose logs -f backend
```

### Cleanup Commands

```bash
# Stop and remove containers
docker-compose down

# Remove volumes too
docker-compose down -v

# Clean up Docker system
docker system prune -f

# Remove all unused images
docker image prune -a -f
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Security Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker container
        run: docker-compose build backend
      
      - name: Run security tests
        run: docker-compose run --rm backend python test_security_docker.py
```

### Railway Deployment

Railway automatically:
1. Detects `Dockerfile`
2. Builds the container
3. Installs dependencies from `requirements.txt`
4. Deploys the application

No additional configuration needed!

## Performance Notes

- **First build**: ~2-3 minutes (downloads base image, installs dependencies)
- **Subsequent builds**: ~30 seconds (uses cache)
- **Test execution**: ~2-5 seconds
- **Container startup**: ~1-2 seconds

## Files Reference

- `backend/Dockerfile` - Container definition
- `docker-compose.yml` - Service orchestration
- `backend/requirements.txt` - Python dependencies (includes bleach==6.1.0)
- `backend/test_security_docker.py` - Security test script
- `backend/api/utils/input_sanitizer.py` - Sanitization utility

## Next Steps

1. ✅ Build container
2. ✅ Run tests
3. ✅ Verify all tests pass
4. ⏭️ Deploy to production
5. ⏭️ Monitor logs for validation errors

## Support

- **Test Results**: See `docs/security/DOCKER_TEST_RESULTS.md`
- **Implementation Guide**: See `docs/security/SECURITY_IMPLEMENTATION.md`
- **Quick Setup**: See `docs/security/SECURITY_SETUP.md`

---

**Last Updated**: 2024  
**Docker Version**: 28.5.1  
**Python Version**: 3.12-slim  
**Bleach Version**: 6.1.0
