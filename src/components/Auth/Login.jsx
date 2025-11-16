import React, { useState } from "react";
import GoogleLoginButton from "./GoogleLoginButton";
import PhoneLogin from "./PhoneLogin";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

export default function Login({ onSuccess, switchToSignup }) {
  const [method, setMethod] = useState("phone");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginEmail = async () => {
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login to LegalLens</h2>

      <div className="auth-tab">
        <button onClick={() => setMethod("phone")} className={method === "phone" ? "active" : ""}>
          Phone
        </button>
        <button onClick={() => setMethod("email")} className={method === "email" ? "active" : ""}>
          Email
        </button>
      </div>

      {method === "phone" ? (
        <PhoneLogin onSuccess={onSuccess} />
      ) : (
        <>
          <input
            type="email"
            className="auth-input"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="auth-input"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn primary-btn" onClick={loginEmail}>
            Login
          </button>
        </>
      )}

      <GoogleLoginButton onSuccess={onSuccess} />

      <p className="switch-text">
        Don’t have an account? 
        <span onClick={switchToSignup}> Sign Up</span>
      </p>
    </div>
  );
}
