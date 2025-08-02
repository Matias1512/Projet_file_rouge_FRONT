// src/AuthContext.js
import { createContext, useEffect, useState } from "react";
import PropTypes from 'prop-types';
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
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
        } catch {
          localStorage.removeItem("token");
          setToken(null);
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
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { AuthContext };
