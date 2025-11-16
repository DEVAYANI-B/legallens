import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { generateSpeech } from '../utils/googleTTS';

function AISummary({ summary, language }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSpeak = async () => {

  // If already speaking — STOP everything
  if (isSpeaking) {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }

    window.speechSynthesis.cancel(); // <-- IMPORTANT FIX

    setIsSpeaking(false);
    return;
  }

  // If audio already generated, play again
  if (audioUrl && audioPlayer) {
    audioPlayer.play();
    setIsSpeaking(true);
    return;
  }

  // Generate new audio using Google TTS
  setIsLoading(true);
  setError('');

  try {
    const url = await generateSpeech(summary, language);
    setAudioUrl(url);

    const audio = new Audio(url);
    setAudioPlayer(audio);

    audio.onplay = () => setIsSpeaking(true);
    audio.onended = () => setIsSpeaking(false);

    audio.onerror = () => {
      setError('Audio playback failed');
      setIsSpeaking(false);
    };

    audio.play();

  } catch (err) {
    console.error('TTS error:', err);
    

    // Fallback
    playBrowserSpeech(summary, language);

  } finally {
    setIsLoading(false);
  }
};

  // Renamed so ESLint does not treat it like a Hook
  const playBrowserSpeech = (text, lang) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="section">
      <div className="section-header">AI Summary</div>
      <div className="section-content">
        <p className="summary-text">{summary}</p>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              backgroundColor: '#fef3c7',
              borderRadius: '6px',
              fontSize: '0.9rem',
              color: '#92400e',
            }}
          >
            {error}
          </div>
        )}

        <button
          className="audio-button"
          onClick={handleSpeak}
          disabled={isLoading}
        >
          {isLoading ? (
            <>⏳ Generating Audio...</>
          ) : isSpeaking ? (
            <>
              <VolumeX size={20} /> Stop Audio
            </>
          ) : (
            <>
              <Volume2 size={20} /> Generate Audio Summary
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default AISummary;
