// Language Detection using franc
import { franc } from 'franc';

export function detectLanguage(text) {
  const langCode = franc(text, { minLength: 10 });
  
  const languageMap = {
    'eng': 'English',
    'tam': 'Tamil',
    'hin': 'Hindi',
  };
  
  return languageMap[langCode] || 'English';
}

export function getLanguageCode(language) {
  const codeMap = {
    'English': 'en-IN',
    'Tamil': 'ta-IN',
    'Hindi': 'hi-IN'
  };
  
  return codeMap[language] || 'en-IN';
}