// src/AuthContext.js
import { createContext, useEffect, useState } from "react";
import PropTypes from 'prop-types';
import axios from "axios";

const AuthContext = createContext();

const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const decoded = JSON.parse(jsonPayload);
    
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier la validité du token au démarrage
    const validateToken = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          await axios.get('https://schooldev.duckdns.org/api/courses', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          setToken(storedToken);
          
          // Décoder le JWT pour extraire les informations utilisateur
          const decodedToken = decodeJWT(storedToken);
          console.log('JWT décodé:', decodedToken);
          if (decodedToken) {
            setUser(decodedToken);
          }
        } catch {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    validateToken();
  }, []);

  useEffect(() => {
    // Intercepteur axios pour attacher le token automatiquement
    const requestInterceptor = axios.interceptors.request.use(
      config => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Intercepteur de réponse pour gérer les erreurs d'authentification
    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  const login = (jwtToken) => {
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);
    
    // Décoder le JWT pour extraire les informations utilisateur
    const decodedToken = decodeJWT(jwtToken);
    if (decodedToken) {
      setUser(decodedToken);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { AuthContext };
