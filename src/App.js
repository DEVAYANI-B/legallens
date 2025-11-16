import React, { useState, useEffect } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import DocumentInfo from './components/DocumentInfo';
import AISummary from './components/AISummary';
import KeyTerms from './components/KeyTerms';
import RiskAnalysis from './components/RiskAnalysis';
import { extractTextFromFile } from './utils/ocrService';
import { analyzeDocument } from './utils/geminiService';
import { detectLanguage, getLanguageCode } from './utils/languageDetection';
import { Search, Loader } from 'lucide-react';
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import { auth } from './firebase';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');
  const [showAuth, setShowAuth] = useState(null);
  const [user, setUser] = useState(null);

  // 🔥 Firebase Auth Listener — remembers login on refresh
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u ? true : false);
    });
    return () => unsubscribe();
  }, []);

  const handleFileSelect = (file) => {
    setUploadedFile(file);
    setAnalysisResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setProgress('Processing document...');

    try {
      const sizeMB = (uploadedFile.size / 1024 / 1024).toFixed(2);
      if (sizeMB > 16) {
        throw new Error(`File size (${sizeMB}MB) exceeds max limit (16MB).`);
      }

      const fileType = uploadedFile.type || uploadedFile.name.toLowerCase();
      if (fileType.includes('pdf')) setProgress('Extracting text from PDF...');
      else if (fileType.includes('doc')) setProgress('Extracting text from Word...');
      else if (fileType.includes('image')) setProgress('Running OCR...');
      else setProgress('Extracting text...');

      const extractedText = await extractTextFromFile(uploadedFile);

      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error('Could not extract readable text from the document.');
      }

      setProgress('Detecting language...');
      const detectedLanguage = detectLanguage(extractedText);
      const languageCode = getLanguageCode(detectedLanguage);

      setProgress('Analyzing document with AI...');
      const analysis = await analyzeDocument(extractedText, detectedLanguage);

      const wordCount = extractedText.split(/\s+/).filter(w => w.length > 0).length;

      setAnalysisResult({
        ...analysis,
        fileName: uploadedFile.name,
        wordCount,
        detectedLanguage,
        languageCode
      });

      setProgress('');

    } catch (err) {
      let msg = err.message || 'Error analyzing document.';
      setError(msg);
      setProgress('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="App">
      {/* HEADER */}
      <header className="app-header">
        <h1 className="logo">LegalLens</h1>

        <div className="auth-buttons">
          {!user ? (
            <>
              <button className="btn-login" onClick={() => setShowAuth("login")}>Login</button>
              <button className="btn-signup" onClick={() => setShowAuth("signup")}>Sign Up</button>
            </>
          ) : (
            <button className="btn-logout" onClick={() => { auth.signOut(); setUser(null); }}>
              Logout
            </button>
          )}
        </div>
      </header>

      {/* AUTH MODAL */}
      {showAuth && (
        <div className="auth-overlay">
          {showAuth === "login" ? (
            <Login
              onSuccess={() => { setShowAuth(null); setUser(true); }}
              switchToSignup={() => setShowAuth("signup")}
            />
          ) : (
            <Signup
              onSuccess={() => { setShowAuth(null); setUser(true); }}
              switchToLogin={() => setShowAuth("login")}
            />
          )}
        </div>
      )}

      {/* MAIN CONTENT (hidden when login/signup open) */}
      {!showAuth && (
        <main className="main-content">

          <FileUpload
            onFileSelect={handleFileSelect}
            uploadedFile={uploadedFile}
            isAnalyzing={isAnalyzing}
          />

          {error && (
            <div className="error-message">
              <p>⚠️ {error}</p>
            </div>
          )}

          {progress && (
            <div className="progress-message">
              <Loader className="spinner" size={20} />
              <p>{progress}</p>
            </div>
          )}

          <button
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={!uploadedFile || isAnalyzing}
          >
            <Search size={20} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Document'}
          </button>

          {analysisResult && (
            <div className="analysis-results">
              <h2 className="results-title">Analysis Results</h2>

              <DocumentInfo
                fileName={analysisResult.fileName}
                wordCount={analysisResult.wordCount}
                documentType={analysisResult.documentType}
                riskLevel={analysisResult.riskLevel}
              />

              <AISummary
                summary={analysisResult.simpleSummary}
                language={analysisResult.languageCode}
              />

              <KeyTerms terms={analysisResult.keyTerms} />

              <RiskAnalysis
                riskyClausesList={analysisResult.riskyClausesList}
                recommendations={analysisResult.recommendations}
              />
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default App;
