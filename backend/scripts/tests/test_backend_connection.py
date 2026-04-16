"""
Test backend connectivity using raw socket HTTP
Run with: docker exec fade_district-backend-1 python /app/scripts/tests/test_backend_connection.py
"""
import socket
import json

def raw_http_get(host, port, path):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(5)
        s.connect((host, port))
        request = f"GET {path} HTTP/1.1\r\nHost: {host}\r\nConnection: close\r\n\r\n"
        s.sendall(request.encode())
        response = b""
        while True:
            chunk = s.recv(4096)
            if not chunk:
                break
            response += chunk
        s.close()
        return response.decode(errors='replace')
    except Exception as e:
        return f"ERROR: {e}"

def raw_http_post(host, port, path, data):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(5)
        s.connect((host, port))
        body = json.dumps(data)
        request = (
            f"POST {path} HTTP/1.1\r\n"
            f"Host: {host}\r\n"
            f"Content-Type: application/json\r\n"
            f"Content-Length: {len(body)}\r\n"
            f"Connection: close\r\n\r\n"
            f"{body}"
        )
        s.sendall(request.encode())
        response = b""
        while True:
            chunk = s.recv(4096)
            if not chunk:
                break
            response += chunk
        s.close()
        return response.decode(errors='replace')
    except Exception as e:
        return f"ERROR: {e}"

print("=== Raw HTTP Backend Test ===\n")

print("1. GET /api/")
r = raw_http_get("localhost", 8000, "/api/")
print(r[:300])

print("\n2. POST /api/auth/login/")
r = raw_http_post("localhost", 8000, "/api/auth/login/", {"email": "test@test.com", "password": "test"})
print(r[:300])

print("\n=== Done ===")
