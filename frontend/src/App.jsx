import "./styles.css";
import React, { useContext } from "react";
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
import MyPage from "./pages/MyPage";
import SEO from "./components/SEO";
import AuthMessage from "./components/AuthMessage";
import { AuthContext } from "./components/AuthProvider";

const App = () => {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <SEO
        title="MDGGU"
        description="마크다운 글을 최적화하는 MDGGU."
        keywords={["Markdown", "MDGGU"]}
      />
      <Header /> <AuthMessage />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/mypage"
          element={user ? <MyPage /> : <Navigate to="/login" />}
        />
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
            user?.email === "admin@example.com" ? (
              <AdminPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
