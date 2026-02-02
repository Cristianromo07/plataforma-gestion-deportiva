// App principal - Configuración de rutas
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';

// Páginas - Auth
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ProfilePage from './features/auth/pages/ProfilePage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';

// Páginas - Dashboard
import DashboardPage from './features/dashboard/pages/DashboardPage';
import { CulturaPage, FomentoPage, ActividadFisicaPage } from './features/dashboard/pages/GenericPages';

// Páginas - Escenarios
import SubgerenciaPage from './features/escenarios/pages/SubgerenciaPage';
import HorarioGestor from './features/escenarios/pages/HorarioGestor';
import NovedadesView from './features/escenarios/pages/NovedadesView';
import ReportarPage from './features/escenarios/pages/ReportarPage';

// Layout compartido
import Layout from './shared/layouts/Layout';

import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Rutas Protegidas (Layout) */}
        <Route element={user ? <Layout /> : <Navigate to="/" />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/subgerencia-escenarios" element={<SubgerenciaPage />} />
          <Route path="/subgerencia-escenarios/reportar" element={<ReportarPage />} />
          <Route path="/subgerencia-escenarios/novedades" element={<NovedadesView />} />
          <Route path="/subgerencia-escenarios/horario-gestor/:date?" element={<HorarioGestor />} />
          <Route path="/cultura" element={<CulturaPage />} />
          <Route path="/fomento-deportivo" element={<FomentoPage />} />
          <Route path="/actividad-fisica" element={<ActividadFisicaPage />} />

          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Ruta por defecto (404) rederige al home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
