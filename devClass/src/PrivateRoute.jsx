// src/PrivateRoute.jsx
import { useAuth } from "./AuthContext";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Ce composant protège l'accès à une route.
 * Si l'utilisateur est authentifié, il peut accéder au contenu.
 * Sinon, il est redirigé vers /login avec mémorisation de la page d'origine.
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirection vers /login et on stocke la route d’origine pour revenir après connexion
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
