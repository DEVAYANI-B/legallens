import React, { useState } from "react";
import GoogleLoginButton from "./GoogleLoginButton";
import PhoneLogin from "./PhoneLogin";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

export default function Signup({ onSuccess, switchToLogin }) {
  const [method, setMethod] = useState("phone"); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");

  const signupEmail = async () => {
    setError("");

    // validation
    if (!email || !password || !confirmPass) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPass) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      onSuccess(); // close modal
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else {
        setError("Signup failed. Try again.");
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Create Account</h2>

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
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            className="auth-input"
            placeholder="Confirm Password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn primary-btn" onClick={signupEmail}>
            Sign Up
          </button>
        </>
      )}

      <GoogleLoginButton onSuccess={onSuccess} />

      <p className="switch-text">
        Already have an account?
        <span onClick={switchToLogin}> Login</span>
      </p>
    </div>
  );
}
