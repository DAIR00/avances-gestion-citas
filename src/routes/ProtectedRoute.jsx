import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

// Componente reutilizable para proteger rutas
export function ProtectedRoute({
  children,
  requiredRoles = null, // null = cualquier usuario logueado
  fallback = "/login", // a dónde redirigir si no tiene acceso
}) {
  const { user, profile, loading, hasRole } = useAuth();
  const location = useLocation();

  // 1. Esperar a cargar sesión
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Cargando sesión...</p>
      </div>
    );
  }

  // 2. No está logueado → Login
  if (!user) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  // 3. Requiere roles específicos y no los tiene → Dashboard o Unauthorized
  if (requiredRoles && !hasRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Todo OK, renderizar el componente hijo
  return children;
}
