import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  Sparkles,
  User,
} from "lucide-react";

import "./Auth.css";


function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");


  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            "Registration failed."
        );

        return;
      }

      setSuccess(
        "Registration successful! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch {
      setError(
        "Unable to connect to the EduRAG server."
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-page">

      {/* Decorative background elements */}
      <div className="auth-background-glow auth-glow-one" />
      <div className="auth-background-glow auth-glow-two" />
      <div className="auth-background-grid" />


      <div className="auth-layout">

        {/* =================================================
            LEFT BRAND PANEL
        ================================================= */}

        <div className="auth-brand-panel">

          <div className="auth-brand">

            <div className="auth-brand-icon">
              <GraduationCap
                size={25}
                strokeWidth={2}
              />
            </div>

            <span>
              EduRAG
            </span>

          </div>


          <div className="auth-brand-content">

            <div className="auth-eyebrow">
              <Sparkles
                size={14}
                strokeWidth={2}
              />

              <span>
                Smarter Academic Learning
              </span>
            </div>

            <h2>
              Your study material,
              <span>
                now interactive.
              </span>
            </h2>

            <p>
              Build your personal academic
              knowledge space and get
              grounded answers directly
              from your study material.
            </p>

          </div>


          <div className="auth-brand-footer">
            <span className="auth-brand-dot" />
            Secure academic workspace
          </div>

        </div>


        {/* =================================================
            REGISTER CARD
        ================================================= */}

        <div className="auth-card">

          <div className="auth-card-glow" />


          <div className="auth-header">

            <div className="auth-mobile-logo">
              <GraduationCap
                size={21}
                strokeWidth={2}
              />
            </div>

            <div className="auth-title-row">

              <div>

                <h1>
                  Create your account
                </h1>

                <p>
                  Start learning with
                  your own academic assistant.
                </p>

              </div>

            </div>

          </div>


          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* FULL NAME */}

            <div className="form-group">

              <label htmlFor="full_name">
                Full name
              </label>

              <div className="auth-input-wrapper">

                <User
                  className="auth-input-icon"
                  size={17}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email address
              </label>

              <div className="auth-input-wrapper">

                <Mail
                  className="auth-input-icon"
                  size={17}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="auth-input-wrapper">

                <Lock
                  className="auth-input-icon"
                  size={17}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff
                      size={17}
                      strokeWidth={1.8}
                    />
                  ) : (
                    <Eye
                      size={17}
                      strokeWidth={1.8}
                    />
                  )}
                </button>

              </div>

            </div>


            {/* ERROR */}

            {error && (
              <div className="auth-error">
                <span className="auth-message-dot" />
                {error}
              </div>
            )}


            {/* SUCCESS */}

            {success && (
              <div className="auth-success">
                <span className="auth-message-dot" />
                {success}
              </div>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >

              {loading ? (
                <span className="auth-button-loading">
                  <span className="auth-spinner" />
                  Creating account...
                </span>
              ) : (
                <>
                  <span>
                    Create account
                  </span>

                  <ArrowRight
                    size={17}
                    strokeWidth={2}
                  />
                </>
              )}

            </button>

          </form>


          {/* FOOTER */}

          <div className="auth-footer">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
            >
              Sign in
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


export default Register;