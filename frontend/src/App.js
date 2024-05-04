import "./App.css";

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Editor from "./components/Editor";
import DocumentList from "./components/DocumentList";
import DocumentDetails from "./components/DocumentDetails";
// import Navbar from "./components/Navbar";
import HomePage from "./components/Home";

const App = () => (
  <Router>
    <Header />
    {/* <Navbar /> */}
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/documents" element={<DocumentList />} />
      <Route path="/documents/:id" element={<DocumentDetails />} />
      <Route path="/editor" element={<Editor />} />
    </Routes>
  </Router>
);

export default App;
