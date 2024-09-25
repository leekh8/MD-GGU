import "./styles.css";
import React from "react";
import useAuthStore from "./store/authStore";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import Editor from "./components/Editor";
import DocumentList from "./components/DocumentList";
import DocumentDetails from "./components/DocumentDetails";
import HomePage from "./components/Home";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminPage from "./pages/AdminPage";

import SEO from "./components/SEO";

const App = () => {
  const { isAuthenticated, role } = useAuthStore();

  return (
    <Router>
      <div>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <SEO
                  title="MDGGU"
                  description="다양한 기술 스택을 활용하여 마크다운 글을 최적화하는 MDGGU."
                  keywords={["Markdown", "MDGGU"]}
                />
              </>
            }
          />
        </Routes>
      </div>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/documents"
          element={
            isAuthenticated ? <DocumentList /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/documents/:id"
          element={
            isAuthenticated ? <DocumentDetails /> : <Navigate to="/login" />
          }
        />
        <Route path="/editor" element={<Editor />} />
        <Route
          path="/admin"
          element={role === "ADMIN" ? <AdminPage /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
