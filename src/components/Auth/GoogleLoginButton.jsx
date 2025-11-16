import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";

export default function GoogleLoginButton({ onSuccess }) {
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess();
    } catch (error) {
      console.error("Google Login failed:", error);
      alert("Google login failed.");
    }
  };

  return (
    <button className="auth-btn google-btn" onClick={handleGoogleLogin}>
      <img src="/google.png" alt="google" className="google-icon" />
      Continue with Google
    </button>
  );
}
