import { Box } from "@chakra-ui/react"
import CodeEditor from "./components/CodeEditor"
import { BrowserRouter as Router, Routes, Route, useLocation  } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import PrivateRoute from "./PrivateRoute";

import Login from "./components/Login";
import Register from "./components/Register";

import { ChakraProvider } from "@chakra-ui/react";
import { LayoutNavBar } from "./components/NavBar";
import { Lessons } from "./components/Lessons";
import AchievementsPage from "./components/Badges";

function AppContent() {
  const location = useLocation();
  const showNavbar = location.pathname !== "/login" && location.pathname !== "/register"; // Ne pas afficher sur /login
 
  return (
    <>
      {showNavbar && <LayoutNavBar />}
      <Routes>
        {/* Page publique */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Page protégée */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AchievementsPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ChakraProvider>
        <Router>
          <AppContent />
        </Router>
      </ChakraProvider>
    </AuthProvider>
  );
}

export default App
