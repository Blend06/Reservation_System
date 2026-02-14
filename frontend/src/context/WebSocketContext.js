import { createContext, useContext, useState, useCallback } from 'react';
import useWebSocket from '../hooks/useWebSocket';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [dashboardUpdates, setDashboardUpdates] = useState([]);

  const handleDashboardMessage = useCallback((data) => {
    console.log('Dashboard update:', data);
    setDashboardUpdates(prev => [data, ...prev].slice(0, 50)); // Keep last 50 updates
    
    // Add to notifications
    if (data.payload?.message) {
      addNotification({
        id: Date.now(),
        type: data.type,
        message: data.payload.message,
        timestamp: new Date(),
        read: false
      });
    }
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Dashboard WebSocket
  const dashboard = useWebSocket(
    'ws://localhost:8000/ws/dashboard/',
    {
      onMessage: handleDashboardMessage,
      onConnect: () => console.log('Dashboard WebSocket connected'),
      onDisconnect: () => console.log('Dashboard WebSocket disconnected')
    }
  );

  return (
    <WebSocketContext.Provider
      value={{
        dashboard,
        notifications,
        dashboardUpdates,
        addNotification,
        markAsRead,
        clearNotifications
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
};
