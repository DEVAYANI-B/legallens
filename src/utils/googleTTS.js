

const TTS_API_KEY = '';
const TTS_API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

export async function generateSpeech(text, languageCode) {
  // Map language codes to Google TTS voice names
  const voiceMap = {
  'en-IN': { languageCode: 'en-IN', name: 'en-IN-Standard-A' },
  'hi-IN': { languageCode: 'hi-IN', name: 'hi-IN-Standard-A' },
  'ta-IN': { languageCode: 'ta-IN', name: 'ta-IN-Standard-A' },
  'te-IN': { languageCode: 'te-IN', name: 'te-IN-Standard-A' },
  'kn-IN': { languageCode: 'kn-IN', name: 'kn-IN-Standard-A' }
};


  const voiceConfig = voiceMap[languageCode] || voiceMap['en-IN'];

  try {
    const response = await fetch(`${TTS_API_URL}?key=${TTS_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: voiceConfig.languageCode,
          name: voiceConfig.name
        },
        audioConfig: {
          audioEncoding: 'MP3',
          pitch: 0,
          speakingRate: 0.9
        }
      })
    });

    if (!response.ok) {
      throw new Error('TTS API failed');
    }

    const data = await response.json();
    
   
    const audioContent = data.audioContent;
    const audioBlob = base64ToBlob(audioContent, 'audio/mp3');
    const audioUrl = URL.createObjectURL(audioBlob);
    
    return audioUrl;
    
  } catch (error) {
    console.error('Google TTS error:', error);
    throw error;
  }
}

function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}