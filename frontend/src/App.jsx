import "./styles.css";

import React, { useState, useEffect } from "react";
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

import { useAuth } from "./components/AuthProvider";
import SEO from "./components/SEO";

const App = () => {
  const { user } = useAuth();

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
                <HomePage />
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
          element={user ? <DocumentList /> : <Navigate to="/login" />}
        />
        <Route
          path="/documents/:id"
          element={user ? <DocumentDetails /> : <Navigate to="/login" />}
        />
        <Route path="/editor" element={<Editor />} />
        <Route
          path="/admin"
          element={
            user && user.role === "ADMIN" ? <AdminPage /> : <Navigate to="/" />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
