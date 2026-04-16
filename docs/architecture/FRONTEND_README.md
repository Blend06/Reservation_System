# Frontend Documentation

## Overview
React.js frontend for the Fade District reservation system with modern UI components, responsive design, and optimized architecture.

## 🏗️ Architecture

### Technology Stack
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client for API calls
- **Zustand** - Lightweight state management

## 📁 Project Structure

```
frontend/src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Modal.jsx         # Modal component with variants
│   │   ├── Table.jsx         # Standardized table component
│   │   ├── StatusBadge.jsx   # Status display component
│   │   ├── LoadingSpinner.jsx # Loading indicators
│   │   └── index.js          # Clean exports
│   ├── forms/                 # Form components
│   │   ├── EditReservationForm.jsx
│   │   ├── EditUserForm.jsx
│   │   └── index.js
│   ├── admin/                 # Admin panel components
│   │   ├── ReservationsManagement.jsx
│   │   └── UsersManagement.jsx
│   ├── auth/                  # Authentication components
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── Dashboard.jsx          # Main dashboard
│   ├── Homepage.jsx           # Landing page
│   └── Reservations.jsx       # User reservations
├── hooks/                     # Custom React hooks
│   ├── useReservations.js    # Reservation state management
│   └── useUsers.js           # User state management
├── utils/                     # Utility functions
│   ├── dateUtils.js          # Date formatting utilities
│   └── statusUtils.js        # Status color/text utilities
├── auth/
│   └── authStore.js          # Authentication state
├── api/
│   └── axios.js              # API configuration
├── router/
│   └── index.js              # Route definitions
├── App.js                    # Main app component
└── index.css                 # Global styles
```

## 🎨 UI Components

### Reusable Components

#### Modal Component
```jsx
<Modal isOpen={isOpen} onClose={onClose} title="Edit Item" size="lg">
  <FormContent />
</Modal>
```

#### Table Component
```jsx
<Table 
  headers={['Name', 'Status', 'Actions']}
  title="Items List"
  subtitle="Manage your items"
>
  {items.map(item => <TableRow key={item.id} />)}
</Table>
```

#### Status Badge
```jsx
<StatusBadge 
  status="confirmed" 
  isEditable={true}
  onChange={handleStatusChange}
/>
```

#### Loading Spinner
```jsx
<LoadingSpinner size="lg" fullScreen={true} />
```

## 🪝 Custom Hooks

### useReservations Hook
```jsx
const {
  reservations,        // Filtered reservations
  allReservations,     // All reservations
  loading,             // Loading state
  filterStatus,        // Current filter
  setFilterStatus,     // Set filter function
  fetchReservations,   // Refresh data
  deleteReservation,   // Delete function
  updateReservationStatus, // Update status
  updateReservation    // Update reservation
} = useReservations();
```

### useUsers Hook
```jsx
const {
  users,          // Users array
  loading,        // Loading state
  fetchUsers,     // Refresh data
  deleteUser,     // Delete function
  updateUser      // Update function
} = useUsers();
```

## 🛠️ Utility Functions

### Date Utilities
```jsx
import { 
  formatDateToDDMMYYYY,    // Format to DD/MM/YYYY
  formatTime,              // Format time display
  formatDateInput,         // Auto-format input
  convertToBackendDate,    // Convert to backend format
  convertFromBackendDate   // Convert from backend
} from '../utils/dateUtils';
```

### Status Utilities
```jsx
import { 
  getStatusColor,      // Get status badge colors
  getUserRoleColor,    // Get user role colors
  getUserRoleText,     // Get user role text
  getActiveStatusColor, // Get active status colors
  capitalizeStatus     // Capitalize status text
} from '../utils/statusUtils';
```

## 🔐 Authentication

### Auth Store (Zustand)
```jsx
const { 
  user,           // Current user
  token,          // JWT token
  isAuthenticated, // Auth status
  login,          // Login function
  logout,         // Logout function
  register        // Register function
} = useAuth();
```

### Protected Routes
```jsx
// Automatic redirection based on auth status
// Admin routes protected by role checking
```

## 📱 Responsive Design

### Breakpoints (Tailwind CSS)
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

### Key Features
- Mobile-first design approach
- Responsive tables with horizontal scroll
- Adaptive navigation
- Touch-friendly buttons and inputs

## 🎯 Key Features

### 1. User Management
- Registration with phone number
- Profile editing
- Role-based access control
- Admin user management panel

### 2. Reservation System
- Create new reservations
- View personal reservations
- Real-time status updates
- Date/time picker with DD/MM/YYYY format

### 3. Admin Panel
- User management (CRUD operations)
- Reservation management
- Status filtering and updates
- System statistics dashboard

### 4. Modern UX
- Loading states for all operations
- Confirmation dialogs for destructive actions
- Form validation and error handling
- Responsive design for all devices

## 🚀 Getting Started

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm start
# Runs on http://localhost:3000
```

### Build for Production
```bash
npm run build
```

### Docker Development
```bash
docker-compose up frontend
```

## 📦 Dependencies

### Core Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "axios": "^1.3.0",
  "zustand": "^4.3.0"
}
```

### Development Dependencies
```json
{
  "tailwindcss": "^3.2.0",
  "postcss": "^8.4.0",
  "autoprefixer": "^10.4.0"
}
```

## 🎨 Styling

### Tailwind Configuration
- Custom color palette
- Responsive utilities
- Component-specific styles
- Dark mode support (future)

### Design System
- Consistent spacing (4px grid)
- Typography scale
- Color palette for status indicators
- Standardized component sizes

## 🔧 API Integration

### Axios Configuration
```jsx
// Automatic token attachment
// Request/response interceptors
// Error handling
// Base URL configuration
```

### Error Handling
- Network error detection
- User-friendly error messages
- Automatic retry for failed requests
- Loading state management

## 🧪 Testing
```bash
npm test
```

## 📈 Performance Optimizations

### Code Splitting
- Route-based code splitting
- Lazy loading for admin components
- Dynamic imports for large dependencies

### State Management
- Efficient re-renders with Zustand
- Memoized components where needed
- Optimized API calls

### Bundle Optimization
- Tree shaking enabled
- Production build optimization
- Asset compression

## 🐳 Docker Support
- Multi-stage Dockerfile
- Nginx serving for production
- Environment variable support
- Health checks included