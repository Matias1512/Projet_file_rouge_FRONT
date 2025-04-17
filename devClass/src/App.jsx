import { Box } from "@chakra-ui/react";
import CodeEditor from "./components/CodeEditor";
import LayoutWithNavbar from "./components/LayoutWithNavbar";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";

import { ChakraProvider } from "@chakra-ui/react";
import Lessons from "./components/Lessons";
import Home from "./components/Home";
import AchievementsPage from "./components/Badges";

import { AuthProvider } from "./AuthContext"; // ✅ Ton contexte d'authentification
import PrivateRoute from "./PrivateRoute"; // ✅ Pour protéger les routes privées

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";
  
  return (
    <>
    <Routes>
      {/* Pages publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Routes avec nav intégrée */}
      {!hideNavbar && (
        <Route element={<LayoutWithNavbar />}>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AchievementsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/editor"
            element={
              <PrivateRoute>
                <CodeEditor />
              </PrivateRoute>
            }
          />
          <Route
            path="/lessons"
            element={
              <PrivateRoute>
                <Lessons />
              </PrivateRoute>
            }
          />
        </Route>
      )}
    </Routes>
  </>
  );
}

function App() {
  return (
    <ChakraProvider>
      <AuthProvider> {/* ✅ AuthProvider doit entourer AppContent */}
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;