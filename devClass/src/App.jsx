import CodeEditor from "./components/CodeEditor";
import LayoutWithNavbar from "./components/LayoutWithNavbar";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";

import { ChakraProvider } from "@chakra-ui/react";
import Lessons from "./components/Lessons";
import Home from "./components/Home";
import AchievementsPage from "./components/Badges";
import QCMExercise from "./components/QCMExercise";
import Profile from "./components/Profile";
import Challenge from "./components/Challenge";

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
            path="/achievements"
            element={
              <PrivateRoute>
                <AchievementsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/"
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
          <Route
            path="/exercise/:exerciseId/qcm"
            element={
              <PrivateRoute>
                <QCMExercise />
              </PrivateRoute>
            }
          />
          <Route
            path="/challenges"
            element={
              <PrivateRoute>
                <Challenge />
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