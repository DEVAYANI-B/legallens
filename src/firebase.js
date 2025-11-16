import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCf9Fok28nuW129fUvcADmYCWEED9Q1tJw",
  authDomain: "legal-lens-1f9e9.firebaseapp.com",
  projectId: "legal-lens-1f9e9",
  storageBucket: "legal-lens-1f9e9.appspot.com",
  messagingSenderId: "197903756796",
  appId: "1:197903756796:web:a437840a5fde4f14be1679"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const setupRecaptcha = () => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",         // container ID
      { size: "invisible" },         // settings
      auth                           // auth instance
    );
  }
};

export default app;
