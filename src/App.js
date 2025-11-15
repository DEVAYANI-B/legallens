import React, { useState } from 'react';
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

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');

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
      throw new Error(`File size (${sizeMB}MB) exceeds maximum allowed size (16MB)`);
    }

   
    const fileType = uploadedFile.type || uploadedFile.name.toLowerCase();

if (fileType.includes('pdf') || uploadedFile.name.toLowerCase().endsWith('.pdf')) {
  setProgress('Extracting text from PDF... (This may take 30-60 seconds)');
} else if (
  fileType.includes('docx') ||
  fileType.includes('msword') ||
  uploadedFile.name.toLowerCase().endsWith('.docx') ||
  uploadedFile.name.toLowerCase().endsWith('.doc')
) {
  setProgress('Extracting text from Word document...');
} else if (fileType.includes('image')) {
  setProgress('Running OCR on image... (This may take 30-60 seconds)');
} else {
  setProgress('Extracting text from document...');
}


    // Step 1: Extract text
    const extractedText = await extractTextFromFile(uploadedFile);
    
    console.log('=== EXTRACTION COMPLETE ===');
    console.log('Extracted text length:', extractedText.length);
    console.log('First 300 chars:', extractedText.substring(0, 300));
    console.log('Last 200 chars:', extractedText.substring(extractedText.length - 200));
    console.log('===========================');
    
    if (!extractedText || extractedText.trim().length < 50) {
      throw new Error('Could not extract sufficient text from document. Please ensure the document contains readable text.');
    }

    setProgress('Detecting language...');
    
    // Step 2: Language Detection
    const detectedLanguage = detectLanguage(extractedText);
    console.log('Detected language:', detectedLanguage);
    const languageCode = getLanguageCode(detectedLanguage);

    setProgress('Analyzing document with AI... Please wait, this analyzes the specific content...');
    
    // Step 3: AI Analysis - THIS IS THE CRITICAL PART
    console.log('=== STARTING AI ANALYSIS ===');
    const analysis = await analyzeDocument(extractedText, detectedLanguage);
    console.log('=== AI ANALYSIS COMPLETE ===');
    console.log('Analysis result:', analysis);

    // Verify we got specific content
    if (analysis.documentType === "Legal Document" && analysis.simpleSummary.includes("contains legal terms")) {
      console.warn('WARNING: Received generic response, not document-specific!');
    }

    // Step 4: Calculate word count
    const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;

    setAnalysisResult({
      ...analysis,
      fileName: uploadedFile.name,
      wordCount,
      detectedLanguage,
      languageCode
    });

    setProgress('');
    
  } catch (err) {
    console.error('=== ANALYSIS ERROR ===');
    console.error('Full error:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    // Detailed error messages
    let errorMessage = 'Failed to analyze document';
    
    if (err.message.includes('size')) {
      errorMessage = err.message;
    } else if (err.message.includes('extract text') || err.message.includes('PDF')) {
      errorMessage = 'Could not read the document. The file might be corrupted or password-protected.';
    } else if (err.message.includes('OCR')) {
      errorMessage = 'Could not read text from image. Please ensure the image is clear and contains readable text.';
    } else if (err.message.includes('DOCX')) {
      errorMessage = 'Could not read Word document. Please try saving it in a newer format or as PDF.';
    } else if (err.message.includes('Unsupported')) {
      errorMessage = err.message;
    } else if (err.message.includes('API') || err.message.includes('AI Analysis')) {
      errorMessage = `${err.message}\n\nTip: Make sure your Google API key is valid and has access to Gemini models.`;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
    setProgress('');
  } finally {
    setIsAnalyzing(false);
  }
};

  return (
    <div className="App">
      <header className="app-header">
        <h1 className="logo">LegalLens</h1>
        <div className="auth-buttons">
          {/* <button className="btn-login">Login</button>
          <button className="btn-signup">Sign up</button> */}
        </div>
      </header>

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
      {/* <div className="disclaimer">
  ⚠️ This application is not a replacement for a lawyer.  
  Always consult a legal professional for advice.
</div> */}

    </div>
  );
}

export default App;