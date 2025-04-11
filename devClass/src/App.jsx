import { Box } from "@chakra-ui/react";
import CodeEditor from "./components/CodeEditor";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";

import { ChakraProvider } from "@chakra-ui/react";
import { LayoutNavBar } from "./components/NavBar";
import { Lessons } from "./components/Lessons";
import AchievementsPage from "./components/Badges";

import { AuthProvider } from "./AuthContext"; // ✅ Ton contexte d'authentification
import PrivateRoute from "./PrivateRoute"; // ✅ Pour protéger les routes privées

function AppContent() {
  const location = useLocation();
  return (
    <>
      <Routes>
        {/* Pages publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Pages protégées */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <LayoutNavBar>
                <AchievementsPage /> 
              </LayoutNavBar>
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