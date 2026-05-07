import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// 1 Creamos el contenedor (context)

const AuthContext = createContext(null);

// 2. Hook personalizado para usar el contexto facilmente
//esto evita importar useContext y AuthContext en cada archivo

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("UseAuth debe usarse dentro de AuthProvider");
  }
  return context;
};

//3 El provider que envuelve la aplicacion
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); //usuario de Supabase Auth
  const [profile, setProfile] = useState(null); //Datos adicionales de nuestra tabla de perfil o profiles
  const [loading, setLoading] = useState(true); //Estado de cargar inicial
  const [error, setError] = useState(null); //manejo o gestion de errores

  //Efecto Escuchar cambios de sesion( login, logout, refresh)
  useEffect(() => {
    //verificar sesion existente al cargar la app
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    checkSession();

    //suscribirse a cambios de autenticacion (login/logout en tiempo real )
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
        }
      },
    );

    // limpieza de suscripcion al desmontar ( es buena practica)
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  //funcion auxiliar: obterner el perfil + el rol desde nuestra base de datos
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
            *,
            roles (name, permissions),
            dependencies(name)            
            `,
        )
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error("Error cargando perfil", err);
      setError("No se pudo cargar el perfil de usuario");
    }
  };

  //Método de autenticacion (clean code: funciones puras y descriptivas)
  const signIn = async (email, password) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            document_number: userData.document_number,
            //El traiger que creamos de SLQ creara automaticamente el perfil
          },
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      //El estado se limpia automaticamente por onAuthStateChange
    } catch (err) {
      setError(err.message);
    }
  };

  //SISTEMA RBAC: helper functions para verificar permisos
  const hasRole = (requiredRoles) => {
    if (!profile?.roles?.name) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(profile.roles.name);
    }
    return profile.roles.name === requiredRoles;
  };

  const isAdmin = () => hasRole("SUPERADMIN");
  const isCoordination = () => hasRole(["COORDINACION", "SUPERADMIN"]);
  const isProfessional = () =>
    hasRole(["PSICOLOGIA", "ENFERMERIA", "TRABAJO_SOCIAL"]);
  const isAprendiz = () => hasRole("APRENDIZ");

  //valor proporcionado a toda la app
  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    //helpers RBAC
    hasRole: hasRole,
    isAdmin,
    isCoordination,
    isProfessional,
    isAprendiz,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
