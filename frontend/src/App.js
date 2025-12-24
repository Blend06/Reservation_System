import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './auth/authStore';
import AppRoutes from './router';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
