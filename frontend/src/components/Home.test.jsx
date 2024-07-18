import React from "react";
import { render, screen } from "@testing-library/react";
import { AuthContext } from "./AuthProvider";
import HomePage from "./HomePage";

describe("HomePage", () => {
  test("renders welcome message with username", () => {
    render(
      <AuthContext.Provider value={{ user: { username: "testuser" } }}>
        <HomePage />
      </AuthContext.Provider>
    );
    const welcomeMessage = screen.getByText(/Hello, testuser!/i);
    expect(welcomeMessage).toBeInTheDocument();

    const viewDocumentsLink = screen.getByText(/View Documents/i);
    expect(viewDocumentsLink).toBeInTheDocument();
    expect(viewDocumentsLink).toHaveAttribute("href", "/documents");

    const startEditingLink = screen.getByText(/Start Editing/i);
    expect(startEditingLink).toBeInTheDocument();
    expect(startEditingLink).toHaveAttribute("href", "/editor");
  });

  test("renders welcome message for guest", () => {
    render(
      <AuthContext.Provider value={{ user: { username: "Guest" } }}>
        <HomePage />
      </AuthContext.Provider>
    );
    const welcomeMessage = screen.getByText(
      /Explore our features to optimize your markdown documents!/i
    );
    expect(welcomeMessage).toBeInTheDocument();
  });

  test("renders loading message when user is null", () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <HomePage />
      </AuthContext.Provider>
    );
    const loadingMessage = screen.getByText(/Loading.../i);
    expect(loadingMessage).toBeInTheDocument();
  });
});
