import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import axios from "axios";
import Register from "../Register";
import { AuthContext } from "../../contexts/AuthContext";

jest.mock("axios");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

const mockLogin = jest.fn();

const renderRegister = () => {
  render(
    <Router>
      <AuthContext.Provider value={{ login: mockLogin }}>
        <Register />
      </AuthContext.Provider>
    </Router>
  );
};

describe("Register Component", () => {
  test("renders Register form", () => {
    renderRegister();
    expect(
      screen.getByRole("heading", { name: /Register/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Register/i })
    ).toBeInTheDocument();
  });

  test("submits form with valid data", async () => {
    axios.post.mockResolvedValue({
      data: { token: "fake-token", message: "Registration successful" },
    });
    renderRegister();

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "newpassword123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/api/auth/register", {
        email: "newuser@example.com",
        password: "newpassword123",
      });
      expect(mockLogin).toHaveBeenCalledWith("fake-token");
      expect(screen.getByText(/Registration successful/i)).toBeInTheDocument();
    });
  });

  test("displays error message on failed registration", async () => {
    axios.post.mockRejectedValue({
      response: { data: { error: "Email already exists" } },
    });
    renderRegister();

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "existing@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email already exists/i)).toBeInTheDocument();
    });
  });
});
