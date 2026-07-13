import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';
import CalendarPage from './pages/Calendar';
import DriverPerformance from './pages/DriverPerformance';
import TripTemplates from './pages/TripTemplates';
import Notifications from './pages/Notifications';

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/expenses" element={<ProtectedRoute roles={['Financial Analyst', 'Fleet Manager']}><Expenses /></ProtectedRoute>} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/driver-performance" element={<DriverPerformance />} />
              <Route path="/trip-templates" element={<TripTemplates />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
