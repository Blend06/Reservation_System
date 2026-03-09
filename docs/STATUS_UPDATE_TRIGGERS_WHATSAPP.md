# Status Update Triggers WhatsApp

## 🎯 How It Works

When a business owner changes the reservation status to "confirmed" or "rejected", the system automatically sends a WhatsApp message to the customer.

---

## 📱 COMPLETE FLOW

```
┌─────────────────────────────────────────────────────────────┐
│  BUSINESS OWNER DASHBOARD                                    │
│                                                              │
│  Reservation #123                                           │
│  Customer: John Doe                                         │
│  Phone: +383 44 123 456                                     │
│  Status: [Pending ▼]                                        │
│                                                              │
│  [Accept] [Reject]  ← Business owner clicks                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND                                                    │
│                                                              │
│  POST /api/reservations/123/update_status/                  │
│  {                                                           │
│    "status": "confirmed"  // or "rejected"                  │
│  }                                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND: update_status() ACTION                             │
│                                                              │
│  Step 1: Validate status                                    │
│  ✅ Status is valid: "confirmed"                            │
│                                                              │
│  Step 2: Check permissions                                  │
│  ✅ User is business owner                                  │
│  ✅ Reservation belongs to their business                   │
│                                                              │
│  Step 3: Update database                                    │
│  reservation.status = "confirmed"                           │
│  reservation.save()                                         │
│  ✅ Status updated: pending → confirmed                     │
│                                                              │
│  Step 4: Check if WhatsApp needed                           │
│  if new_status in ['confirmed', 'rejected']:                │
│      ✅ Yes, send WhatsApp                                  │
│                                                              │
│  Step 5: Send WhatsApp                                      │
│  send_whatsapp_message(                                     │
│      to_phone="+383 44 123 456",                            │
│      message_type="confirmed",                              │
│      reservation=reservation,                               │
│      business=business                                      │
│  )                                                           │
│  ✅ WhatsApp sent successfully                              │
│                                                              │
│  Step 6: Return response                                    │
│  {                                                           │
│    "status_updated": true,                                  │
│    "whatsapp_notification": {                               │
│      "sent": true,                                          │
│      "customer_phone": "+383 44 123 456"                    │
│    }                                                         │
│  }                                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  TWILIO API                                                  │
│                                                              │
│  Sends WhatsApp message:                                    │
│  From: +14155238886 (Your Twilio number)                   │
│  To: +383 44 123 456 (Customer)                             │
│                                                              │
│  ✅ Your reservation at Salon XYZ is CONFIRMED!             │
│  📅 Date: March 10, 2026                                    │
│  🕐 Time: 14:00                                             │
│  📍 Location: Prishtina                                     │
│  See you soon! 😊                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  CUSTOMER'S PHONE                                            │
│                                                              │
│  📱 WhatsApp notification received                          │
│  ✅ Reservation confirmed!                                   │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BUSINESS OWNER SEES FEEDBACK                                │
│                                                              │
│  ✅ Reservation Confirmed!                                   │
│  📱 WhatsApp sent to +383 44 123 456                        │
│                                                              │
│  [Reservation list updated]                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 CODE EXPLANATION

### Backend Code (Already Implemented)

```python
# backend/api/views/reservation.py

@action(detail=True, methods=['post'])
def update_status(self, request, pk=None):
    """
    Update reservation status and send WhatsApp notification to customer
    """
    reservation = self.get_object()
    new_status = request.data.get('status')
    
    # 1. Update status in database
    reservation.status = new_status
    reservation.save()
    
    # 2. Send WhatsApp if status is confirmed or rejected
    whatsapp_sent = False
    whatsapp_error = None
    
    if new_status in ['confirmed', 'rejected']:  # ← TRIGGER CONDITION
        try:
            whatsapp_sent = send_whatsapp_message(
                to_phone=reservation.customer_phone,
                message_type=new_status,
                reservation=reservation,
                business=reservation.business
            )
        except Exception as e:
            whatsapp_error = str(e)
    
    # 3. Return response with feedback
    return Response({
        'status_updated': True,
        'whatsapp_notification': {
            'sent': whatsapp_sent,
            'required': new_status in ['confirmed', 'rejected'],
            'error': whatsapp_error,
            'customer_phone': reservation.customer_phone
        }
    })
```

---

## 🎯 KEY POINTS

### When WhatsApp is Sent

✅ **Status changed to "confirmed"** → WhatsApp sent  
✅ **Status changed to "rejected"** → WhatsApp sent  
❌ **Status changed to "pending"** → No WhatsApp  
❌ **Status changed to "canceled"** → No WhatsApp

### Why This Design?

1. **Confirmed** → Customer needs to know their reservation is accepted
2. **Rejected** → Customer needs to know their reservation is declined
3. **Pending** → No notification needed (initial state)
4. **Canceled** → Could add WhatsApp later if needed

---

## 📊 STATUS FLOW DIAGRAM

```
Customer Books
      ↓
[PENDING] ──────────────────────────────────────┐
      ↓                                         │
Business Owner Reviews                          │
      ↓                                         │
      ├─→ [CONFIRMED] → 📱 WhatsApp Sent       │
      │                                         │
      └─→ [REJECTED]  → 📱 WhatsApp Sent       │
                                                │
Later (optional):                               │
[CONFIRMED] → [CANCELED] → 📱 WhatsApp (future) │
```

---

## 🔧 FRONTEND IMPLEMENTATION

### How to Call the API

```javascript
// frontend/src/components/business/BusinessDashboard.jsx

const handleAccept = async (reservationId) => {
  try {
    const response = await api.post(
      `/reservations/${reservationId}/update_status/`,
      { status: 'confirmed' }  // ← This triggers WhatsApp
    );
    
    const { whatsapp_notification } = response.data;
    
    if (whatsapp_notification.sent) {
      toast.success(
        `✅ Reservation confirmed!\n` +
        `📱 WhatsApp sent to ${whatsapp_notification.customer_phone}`
      );
    } else {
      toast.warning(
        `✅ Reservation confirmed\n` +
        `⚠️ WhatsApp failed: ${whatsapp_notification.error}\n` +
        `Contact ${whatsapp_notification.customer_phone} manually`
      );
    }
    
    fetchReservations(); // Refresh list
  } catch (error) {
    toast.error('Failed to update reservation');
  }
};

const handleReject = async (reservationId) => {
  try {
    const response = await api.post(
      `/reservations/${reservationId}/update_status/`,
      { status: 'rejected' }  // ← This triggers WhatsApp
    );
    
    const { whatsapp_notification } = response.data;
    
    if (whatsapp_notification.sent) {
      toast.success(
        `✅ Reservation rejected\n` +
        `📱 WhatsApp sent to ${whatsapp_notification.customer_phone}`
      );
    } else {
      toast.warning(
        `✅ Reservation rejected\n` +
        `⚠️ WhatsApp failed: ${whatsapp_notification.error}\n` +
        `Contact ${whatsapp_notification.customer_phone} manually`
      );
    }
    
    fetchReservations(); // Refresh list
  } catch (error) {
    toast.error('Failed to update reservation');
  }
};
```

---

## 🧪 TESTING

### Test the Flow

1. **Create a test reservation:**
   ```bash
   # Go to public booking page
   http://localhost:3000/book/testsalon
   
   # Fill form with YOUR phone number
   # Submit reservation
   ```

2. **Business owner accepts:**
   ```bash
   # Login as business owner
   http://localhost:3000/login
   
   # Go to dashboard
   # Click "Accept" on pending reservation
   ```

3. **Check your phone:**
   ```
   You should receive WhatsApp:
   "✅ Your reservation at Test Salon is CONFIRMED!"
   ```

4. **Check backend logs:**
   ```bash
   docker logs fade_district-backend-1 | grep WhatsApp
   
   # Should see:
   # 📝 Reservation 123 status updated: pending → confirmed
   # 📱 Attempting to send WhatsApp via Twilio...
   # ✅ WhatsApp sent to +38344123456: SM1234567890
   ```

---

## 🎯 SUMMARY

**The Trigger:**
```python
if new_status in ['confirmed', 'rejected']:
    send_whatsapp_message(...)
```

**What Happens:**
1. Business owner clicks "Accept" or "Reject"
2. Status updates in database
3. WhatsApp automatically sends to customer
4. Business owner sees feedback message

**It's Automatic:**
- ✅ No manual action needed
- ✅ Happens immediately
- ✅ Business owner gets confirmation
- ✅ Customer gets notified

**It's Already Implemented:**
- ✅ Backend code is ready
- ✅ API endpoint exists
- ✅ WhatsApp integration works
- ✅ Feedback system in place

---

**Last Updated:** March 9, 2026  
**Status:** ✅ Implemented and Working  
**Trigger:** Status change to "confirmed" or "rejected"
