import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";

test("renders LoginPage when accessing /login", () => {
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <App />
    </MemoryRouter>
  );
  const loginHeading = screen.getByRole("heading", { name: /login/i }); // LoginPage에 "Login" 제목이 있다고 가정
  expect(loginHeading).toBeInTheDocument();
});
