
import { useState } from "react";
import { API_URL } from "../../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobile, setMobile] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (isForgotPassword && password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isForgotPassword
        ? "reset-password"
        : isRegister
        ? "register"
        : "login";

      const requestData = isForgotPassword
        ? {
            email: email.trim().toLowerCase(),
            password,
          }
        : isRegister
        ? {
            name,
            email: email.trim().toLowerCase(),
            password,
            mobile,
          }
        : {
            email: email.trim().toLowerCase(),
            password,
          };

      const response = await fetch(`${API_URL}/users/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage(data.message);

      if (isForgotPassword) {
        setPassword("");
        setConfirmPassword("");
        setIsForgotPassword(false);
        setIsRegister(false);
      } else if (isRegister) {
        setName("");
        setEmail("");
        setPassword("");
        setMobile("");
      } else {
        login(data.token, data.user);

        // Admin goes to Admin Dashboard
        // Customer always goes to Home Page
        if (data.user?.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-image">
          <div className="auth-image-content">
            <span>THE CLOTH BAZAR EXPERIENCE</span>
            <h2>Style is a way to say who you are.</h2>
            <p>Discover fashion that feels uniquely yours.</p>
          </div>
        </div>

        <div className="auth-form-section">
          <span className="auth-eyebrow">
            WELCOME TO CLOTH BAZAR
          </span>

          {!isRegister && !isForgotPassword && location.state?.from && (
            <p className="auth-message">
              Please login or create an account to explore our
              exclusive fashion collection and enjoy your shopping experience.
            </p>
          )}

          <h1>
            {isForgotPassword
              ? "Reset Password"
              : isRegister
              ? "Create Account"
              : "Welcome Back"}
          </h1>

          <p className="auth-subtitle">
            {isForgotPassword
              ? "Enter your email and create a new password."
              : isRegister
              ? "Create your account and discover your style."
              : "Sign in to continue your fashion journey."}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <label>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="Enter 10 digit mobile number"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </>
            )}

            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>
              {isForgotPassword ? "New Password" : "Password"}
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {isForgotPassword && (
              <>
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </>
            )}

            {!isRegister && !isForgotPassword && (
              <p
                className="forgot-password-link"
                onClick={() => {
                  setIsForgotPassword(true);
                  setMessage("");
                }}
              >
                Forgot Password?
              </p>
            )}

            <button
              className="auth-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "PLEASE WAIT..."
                : isForgotPassword
                ? "RESET PASSWORD"
                : isRegister
                ? "CREATE ACCOUNT"
                : "SIGN IN"}
            </button>
          </form>

          {message && <p className="auth-message">{message}</p>}

          <p className="auth-switch">
            {isForgotPassword
              ? "Remember your password?"
              : isRegister
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setIsRegister(isForgotPassword ? false : !isRegister);
                setMessage("");
                setPassword("");
                setConfirmPassword("");
              }}
            >
              {isForgotPassword
                ? "Sign In"
                : isRegister
                ? "Sign In"
                : "Create Account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
