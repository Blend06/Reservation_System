# WebSocket Real-Time System Documentation

## 🔌 Overview

The WebSocket Real-Time System enables instant, bidirectional communication between the server and clients without page refreshes. This provides a modern, responsive user experience with live updates.

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
├─────────────────────────────────────────────────────────────────┤
│  React Components                                               │
│    ↓                                                            │
│  WebSocketContext (State Management)                           │
│    ↓                                                            │
│  useWebSocket Hook (Connection Logic)                          │
│    ↓                                                            │
│  WebSocket Connection (ws://localhost:8000/ws/dashboard/)      │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               │ Persistent Connection
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                         SERVER (Django)                         │
├─────────────────────────────────────────────────────────────────┤
│  Daphne (ASGI Server)                                          │
│    ↓                                                            │
│  Django Channels (WebSocket Handler)                           │
│    ↓                                                            │
│  Consumer (DashboardConsumer)                                  │
│    ↓                                                            │
│  Channel Layer (Redis)                                         │
│    ↓                                                            │
│  Django Signals (post_save, post_delete)                       │
│    ↓                                                            │
│  WebSocket Utils (Broadcast Messages)                          │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 How It Works

### 1. **Connection Establishment**

When a user opens the dashboard:

```javascript
// Frontend: useWebSocket hook creates connection
const ws = new WebSocket('ws://localhost:8000/ws/dashboard/?token=JWT_TOKEN');

// Backend: DashboardConsumer accepts connection
async def connect(self):
    # Verify user is super admin
    if self.user.is_super_admin:
        await self.channel_layer.group_add('dashboard_updates', self.channel_name)
        await self.accept()
```

### 2. **Real-Time Event Flow**

When a business is created:

```
1. User creates business via API
   ↓
2. Django saves business to database
   ↓
3. post_save signal fires
   ↓
4. websocket_utils.send_dashboard_update() called
   ↓
5. Message sent to Redis Channel Layer
   ↓
6. Channel Layer broadcasts to all connected clients
   ↓
7. DashboardConsumer receives message
   ↓
8. Consumer sends to WebSocket
   ↓
9. Frontend receives update
   ↓
10. React state updates
   ↓
11. UI refreshes automatically
```

### 3. **Message Format**

```json
{
  "type": "business_created",
  "payload": {
    "business": {
      "id": "uuid",
      "name": "New Salon",
      "subdomain": "newsalon"
    },
    "message": "New business 'New Salon' created"
  },
  "timestamp": "2026-02-14T18:30:00Z"
}
```

## 🔧 Components Explained

### **Daphne - ASGI Server**

**What is Daphne?**
- Daphne is an HTTP, HTTP2, and WebSocket protocol server for ASGI (Asynchronous Server Gateway Interface)
- It's the production-ready server for Django Channels
- Replaces traditional WSGI servers (like Gunicorn) for async applications

**Why Daphne?**
- **WebSocket Support**: WSGI servers can't handle WebSockets; Daphne can
- **Async/Await**: Supports Python's async/await syntax
- **HTTP/2**: Modern protocol support
- **Production Ready**: Battle-tested by Instagram, Mozilla, and others

**How it works:**
```python
# Traditional WSGI (synchronous)
wsgi.py → Gunicorn → Django Views

# Modern ASGI (asynchronous)
asgi.py → Daphne → Django Channels → WebSocket Consumers
```

**Command:**
```bash
daphne -b 0.0.0.0 -p 8000 backend.asgi:application
```

### **Django Channels**

**What is Channels?**
- Extends Django to handle WebSockets, chat protocols, IoT protocols
- Adds async capabilities to Django
- Uses "Channel Layers" for message passing

**Key Concepts:**
1. **Consumer**: Like a Django view, but for WebSockets
2. **Channel Layer**: Message bus (uses Redis) for inter-process communication
3. **Routing**: URL routing for WebSocket connections

### **Redis Channel Layer**

**Why Redis?**
- **Fast**: In-memory data store
- **Pub/Sub**: Built-in publish/subscribe messaging
- **Scalable**: Can handle thousands of connections
- **Already in use**: We're using Redis for Celery anyway

**How it works:**
```python
# Send message to group
channel_layer.group_send('dashboard_updates', {
    'type': 'business_created',
    'data': {...}
})

# All consumers in 'dashboard_updates' group receive the message
```

## 📧 Email System Integration

### **Email System Still Works!**

✅ **WebSockets and Emails work together, not instead of each other**

**Use Cases:**

| Feature | WebSocket | Email |
|---------|-----------|-------|
| **Real-time dashboard updates** | ✅ Yes | ❌ No |
| **Notification bell** | ✅ Yes | ❌ No |
| **Business owner notifications** | ❌ No | ✅ Yes |
| **Reservation confirmations** | ❌ No | ✅ Yes |
| **Offline notifications** | ❌ No | ✅ Yes |
| **Audit trail** | ❌ No | ✅ Yes |

**Why Both?**

1. **WebSockets**: For users actively using the dashboard
   - Instant updates
   - No page refresh
   - Better UX

2. **Emails**: For users not on the dashboard
   - Persistent notifications
   - Works offline
   - Professional communication
   - Legal/audit requirements

**Example Flow:**

```
New Reservation Created
    ↓
    ├─→ WebSocket: Notify super admin dashboard (if online)
    │   └─→ Shows notification bell badge
    │   └─→ Updates reservation count
    │
    └─→ Email: Send to business owner (always)
        └─→ Professional email with details
        └─→ Works even if owner is offline
```

## 🔐 Security

### **Authentication**

```javascript
// Token sent in WebSocket URL
ws://localhost:8000/ws/dashboard/?token=JWT_TOKEN

// Backend verifies token
async def connect(self):
    if not self.user.is_super_admin:
        await self.close()  // Reject connection
```

### **Authorization**

- **Super Admin**: Can connect to dashboard WebSocket
- **Business Owner**: Can connect to their business WebSocket (future)
- **Public**: Cannot connect to any WebSocket

### **Data Isolation**

- Each user group has separate channel
- Messages only sent to authorized users
- No cross-business data leakage

## 🚀 Performance

### **Scalability**

- **Concurrent Connections**: Redis can handle 10,000+ connections
- **Message Throughput**: 100,000+ messages/second
- **Latency**: < 10ms for local Redis

### **Resource Usage**

- **Memory**: ~1MB per WebSocket connection
- **CPU**: Minimal (async I/O)
- **Network**: Only sends data when changes occur

## 📱 Features Enabled

### **1. Real-Time Notifications**

```javascript
// Notification appears instantly
{
  "message": "New business 'Salon XYZ' created",
  "type": "business_created",
  "timestamp": "2026-02-14T18:30:00Z"
}
```

### **2. Live Dashboard Updates**

- Business count updates automatically
- Recent businesses list refreshes
- Analytics charts update in real-time

### **3. Activity Feed**

- See what's happening across the platform
- Last 50 activities stored
- Filterable by type

### **4. Connection Status**

```javascript
const { isConnected } = useWebSocketContext();

// Show indicator
{isConnected ? '🟢 Live' : '🔴 Offline'}
```

## 🔄 Auto-Reconnection

```javascript
// If connection drops, automatically reconnect
ws.current.onclose = () => {
    setTimeout(() => {
        connect();  // Reconnect after 3 seconds
    }, 3000);
};
```

## 🧪 Testing

### **Test WebSocket Connection**

```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c ws://localhost:8000/ws/dashboard/

# Send ping
{"type": "ping"}

# Receive pong
{"type": "pong"}
```

### **Test Real-Time Updates**

1. Open dashboard in two browser tabs
2. Create a business in tab 1
3. See notification appear in tab 2 instantly

## 📊 Monitoring

### **Check Active Connections**

```python
# Django shell
from channels.layers import get_channel_layer
channel_layer = get_channel_layer()

# Get group info
await channel_layer.group_send('dashboard_updates', {
    'type': 'ping'
})
```

### **Redis Monitoring**

```bash
# Connect to Redis
docker exec -it fade_district-redis-1 redis-cli

# Monitor commands
MONITOR

# Check pub/sub channels
PUBSUB CHANNELS
```

## 🐛 Troubleshooting

### **WebSocket Won't Connect**

1. Check Daphne is running (not Gunicorn)
2. Verify Redis is running
3. Check CORS settings allow WebSocket
4. Verify JWT token is valid

### **Messages Not Received**

1. Check user is in correct group
2. Verify signal is firing
3. Check Redis connection
4. Look at browser console for errors

### **High Memory Usage**

1. Limit stored messages (currently 50)
2. Close inactive connections
3. Use Redis persistence settings

## 🔮 Future Enhancements

1. **Business-Specific Channels**: Each business owner gets their own channel
2. **Typing Indicators**: Show when admin is responding
3. **Read Receipts**: Track when notifications are read
4. **Message History**: Store messages in database
5. **Push Notifications**: Browser push API integration
6. **Mobile App**: WebSocket support for mobile apps

## 📝 Summary

**WebSockets provide:**
- ✅ Real-time updates without page refresh
- ✅ Better user experience
- ✅ Instant notifications
- ✅ Live activity feed
- ✅ Scalable architecture

**Emails provide:**
- ✅ Offline notifications
- ✅ Professional communication
- ✅ Audit trail
- ✅ Legal compliance
- ✅ Works for all users

**Together, they create a complete notification system that works online and offline!**

---

**Implementation Status**: ✅ Complete and Ready to Use

**Next Steps**:
1. Install dependencies: `pip install -r requirements.txt`
2. Restart backend with Daphne
3. Test WebSocket connection
4. Create a business and watch real-time updates!
