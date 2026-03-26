import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode';
import { clearUserCache } from './context/UserContext';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import Withdrawal from './pages/Withdrawal';
import Deposit from './pages/Deposit';
import Bills from './pages/Bills';
import AuthGuard from './auth/Authguard';
import Transaction from './pages/Transaction';
import UserProfile from './pages/UserProfile';
import Savings from './pages/Savings';
import Admin from './pages/Admin';
import ForgotPassword from './pages/ForgotPassword';
// import Notification from './pages/Notification';
import Notifications from './pages/Notifications';
// import DashboardLayout from './components/DashboardLayout';



const cookies = new Cookies();

function checkAuth() {
  const token = cookies.get("token");
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      cookies.remove("token", { path: "/" });
      return false;
    }
    return true;
  } catch {
    cookies.remove("token", { path: "/" });
    return false;
  }
}

function App() {
  const [isAuth, setIsAuth] = useState(() => checkAuth());

  // Call this after login/logout to sync auth state
  const refreshAuth = useCallback(() => setIsAuth(checkAuth()), []);

  const handleLogout = useCallback(() => {
    const cookies = new Cookies();
    cookies.remove("token", { path: "/" });
    clearUserCache();
    window.location.href = "/login";
  }, []);

  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route index element={<LandingPage />} />
      <Route path='/login' element={isAuth ? <Navigate to="/dashboard" replace /> : <Login onLogin={refreshAuth} />} />
      <Route path='/register' element={isAuth ? <Navigate to="/dashboard" replace /> : <Register onLogin={refreshAuth} />} />
      <Route path='/forgot-password' element={isAuth ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} />

      {/* ── Protected routes ── */}
      <Route element={<AuthGuard isAuth={isAuth} />}>
        {/* <Route element={<DashboardLayout />}></Route> */}
        <Route path='/dashboard' element={<Dashboard onLogout={handleLogout} />} />
        <Route path='/transfer' element={<Transfer onLogout={handleLogout} />} />
        <Route path='/withdrawal' element={<Withdrawal onLogout={handleLogout} />} />
        <Route path='/deposit' element={<Deposit onLogout={handleLogout} />} />
        <Route path='/bills' element={<Bills onLogout={handleLogout} />} />
        <Route path='/transactions' element={<Transaction onLogout={handleLogout} />} />
        <Route path='/profile' element={<UserProfile onLogout={handleLogout} />} />
        <Route path='/savings' element={<Savings onLogout={handleLogout} />} />
        <Route path='/admin' element={<Admin onLogout={handleLogout} />} />
        <Route path='/notifications' element={<Notifications onLogout={handleLogout} />} />
      </Route>

      {/* ── Fallback ── */}
      <Route path='*' element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;