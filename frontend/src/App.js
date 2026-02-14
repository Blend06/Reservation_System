import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './auth/authStore';
import { WebSocketProvider } from './context/WebSocketContext';
import AppRoutes from './router';

function App() {
  return (
    <AuthProvider>
      <Router>
        <WebSocketProvider>
          <div className="App">
            <AppRoutes />
          </div>
        </WebSocketProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
