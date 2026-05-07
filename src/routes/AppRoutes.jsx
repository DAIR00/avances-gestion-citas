import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../providers/AuthProvider";
import { Navigate } from "react-router-dom";

// Lazy loading para code splitting (mejor performance)
import { lazy, Suspense } from "react";

// Públicas
const Login = lazy(() => import("../features/auth/pages/Login"));
const Register = lazy(() => import("../features/auth/pages/Register"));
const Unauthorized = lazy(() => import("../shared/components/Unauthorized"));

// Privadas - Aprendiz
const AprendizDashboard = lazy(
  () => import("../features/appointments/pages/AprendizDashboard"),
);

// Privadas - Profesional
const ProfessionalDashboard = lazy(
  () => import("../features/appointments/pages/ProfessionalDashboard"),
);

// Privadas - Coordinación
const CoordinationDashboard = lazy(
  () => import("../features/dashboard/pages/CoordinationDashboard"),
);

// Privadas - Admin
const AdminDashboard = lazy(
  () => import("../features/admin/pages/AdminDashboard"),
);

export function AppRoutes() {
  const { isAprendiz, isProfessional, isCoordination, isAdmin } = useAuth();

  // Redirección inteligente según rol (después del login)
  const getHomeRoute = () => {
    if (isAdmin()) return "/admin";
    if (isCoordination()) return "/coordination";
    if (isProfessional()) return "/professional";
    return "/dashboard"; // Aprendiz por defecto
  };

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* RUTAS PROTEGIDAS - APRENDIZ */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRoles="APRENDIZ">
              <AprendizDashboard />
            </ProtectedRoute>
          }
        />

        {/* RUTAS PROTEGIDAS - PROFESIONALES */}
        <Route
          path="/professional"
          element={
            <ProtectedRoute
              requiredRoles={["PSICOLOGIA", "ENFERMERIA", "TRABAJO_SOCIAL"]}
            >
              <ProfessionalDashboard />
            </ProtectedRoute>
          }
        />

        {/* RUTAS PROTEGIDAS - COORDINACIÓN */}
        <Route
          path="/coordination"
          element={
            <ProtectedRoute requiredRoles={["COORDINACION", "SUPERADMIN"]}>
              <CoordinationDashboard />
            </ProtectedRoute>
          }
        />

        {/* RUTAS PROTEGIDAS - ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRoles="SUPERADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* REDIRECCIÓN INICIAL */}
        <Route path="/" element={<Navigate to={getHomeRoute()} replace />} />

        {/* 404 */}
        <Route path="*" element={<div>404 - Página no encontrada</div>} />
      </Routes>
    </Suspense>
  );

}
