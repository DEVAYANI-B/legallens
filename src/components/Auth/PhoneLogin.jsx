import React, { useState } from "react";
import { auth, setupRecaptcha } from "../../firebase";
import { signInWithPhoneNumber } from "firebase/auth";

export default function PhoneLogin({ onSuccess }) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const sendOtp = async () => {
  setupRecaptcha();
  const verifier = window.recaptchaVerifier;

  try {
    const result = await signInWithPhoneNumber(auth, phone, verifier);
    setConfirmationResult(result);
    setOtpSent(true);
  } catch (err) {
    console.error("OTP Error:", err);
    alert("Failed to send OTP");
  }
};


  const verifyOtp = async () => {
    try {
      await confirmationResult.confirm(otp);
      onSuccess();
    } catch (error) {
      alert("Invalid OTP");
    }
  };

  return (
    <>
      <div id="recaptcha-container"></div>

      {!otpSent ? (
        <>
          <input
            type="text"
            className="auth-input"
            placeholder="+91 Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button className="auth-btn primary-btn" onClick={sendOtp}>
            Send OTP
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            className="auth-input"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button className="auth-btn primary-btn" onClick={verifyOtp}>
            Verify OTP
          </button>
        </>
      )}
    </>
  );
}
