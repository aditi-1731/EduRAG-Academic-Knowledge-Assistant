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
} from "lucide-react";

import { useAuth } from "../context/useAuth";
import "./Auth.css";


function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


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
    setLoading(true);

    try {
      await login(
        formData.email,
        formData.password
      );

      navigate("/");
    } catch (error) {
      setError(
        error.message || "Login failed."
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
                AI-Powered Learning
              </span>
            </div>

            <h2>
              Turn your study
              <span>
                material into answers.
              </span>
            </h2>

            <p>
              Upload your academic PDFs,
              ask questions, and understand
              your study material with
              context-based answers.
            </p>

          </div>


          <div className="auth-brand-footer">
            <span className="auth-brand-dot" />
            Academic Knowledge Assistant
          </div>

        </div>


        {/* =================================================
            LOGIN CARD
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
                  Welcome back
                </h1>

                <p>
                  Sign in to continue
                  learning with EduRAG.
                </p>
              </div>
            </div>

          </div>


          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

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

              <div className="form-label-row">

                <label htmlFor="password">
                  Password
                </label>

              </div>


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
                  placeholder="Enter your password"
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


            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >

              {loading ? (
                <span className="auth-button-loading">
                  <span className="auth-spinner" />
                  Signing in...
                </span>
              ) : (
                <>
                  <span>
                    Sign in
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
              Don't have an account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/register")
              }
            >
              Create account
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


export default Login;