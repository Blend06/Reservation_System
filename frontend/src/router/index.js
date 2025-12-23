import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register';
import Reservations from '../components/Reservations';
import { authStore } from '../auth/authStore';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/reservations" 
        element={
          authStore.isAuthenticated() ? 
          <Reservations /> : 
          <Navigate to="/login" />
        } 
      />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;