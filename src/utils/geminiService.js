

const API_KEY = 'AIzaSyCjaU4hZjmGeB0IEqxhaJHx7L6x7UZ0VhU'; 

const MODELS = [
  {
    name: 'gemini-1.5-flash-8b',
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent'
  },
  {
    name: 'gemini-1.5-flash',
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
  },
  {
    name: 'gemini-2.5-pro',
    url: 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent'
  }
];

export async function analyzeDocument(extractedText, detectedLanguage) {
  const truncatedText = extractedText.length > 10000 
    ? extractedText.substring(0, 10000) + '\n\n[Document truncated for analysis]'
    : extractedText;

  const systemPrompt = `You are an expert legal document analyzer helping rural Indian citizens understand complex legal documents.

ANALYZE THIS SPECIFIC DOCUMENT - DO NOT GIVE GENERIC RESPONSES!

Extract ACTUAL information from the document text below:
- Real party names
- Specific amounts (money, penalties)
- Exact time periods
- Actual clauses and terms

Respond ONLY with valid JSON. No markdown, no code blocks, no extra text.`;

  const userPrompt = `Document Language: ${detectedLanguage}

Document Text:
${truncatedText}

Return this JSON structure with SPECIFIC information from the document:

{
  "documentType": "Specific type (e.g., 'Cost Plus Construction Contract between Hoku Materials and XYZ')",
  "simpleSummary": "2-3 sentences in ${detectedLanguage} about THIS document. Mention specific parties, amounts, dates, terms from the text.",
  "keyTerms": [
    {"term": "Actual term from document", "explanation": "Simple explanation in ${detectedLanguage}"},
    {"term": "Another actual term", "explanation": "Explanation in ${detectedLanguage}"},
    {"term": "Third term", "explanation": "Explanation in ${detectedLanguage}"},
    {"term": "Fourth term", "explanation": "Explanation in ${detectedLanguage}"}
  ],
  "riskyClausesList": [
    {"clause": "SPECIFIC risky clause from THIS document", "risk": "Why risky in ${detectedLanguage}"},
    {"clause": "Another SPECIFIC risky clause", "risk": "Risk in ${detectedLanguage}"}
  ],
  "riskLevel": "LOW or MEDIUM or HIGH or CRITICAL",
  "recommendations": [
    "Specific recommendation for THIS document in ${detectedLanguage}",
    "Another recommendation in ${detectedLanguage}",
    "Third recommendation in ${detectedLanguage}"
  ]
}`;

  console.log('=== STARTING GEMINI API CALL ===');
  console.log('Document length:', truncatedText.length);
  console.log('Language:', detectedLanguage);

  
  let lastError = null;

  for (const model of MODELS) {
    try {
      console.log(`Trying model: ${model.name}...`);

      const response = await fetch(`${model.url}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemPrompt },
                { text: userPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 4096,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
          ]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn(`${model.name} failed:`, data.error?.message || response.status);
        lastError = data.error?.message || `HTTP ${response.status}`;
        continue; // Try next model
      }

      console.log(`✅ ${model.name} SUCCESS!`);

      if (!data.candidates || !data.candidates[0]) {
        console.warn('No candidates in response');
        continue;
      }

      const candidate = data.candidates[0];
      
     
      if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
        console.warn(`Content blocked: ${candidate.finishReason}`);
        continue;
      }

      const textResponse = candidate.content.parts[0].text;
      console.log('Raw response length:', textResponse.length);
      console.log('First 500 chars:', textResponse.substring(0, 500));

      // Clean and parse JSON
      let cleanText = textResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .replace(/`/g, '')
        .trim();

      // Find JSON object
      const jsonStart = cleanText.indexOf('{');
      const jsonEnd = cleanText.lastIndexOf('}');

      if (jsonStart === -1 || jsonEnd === -1) {
        console.warn('No JSON found in response');
        console.log('Cleaned text:', cleanText);
        continue;
      }

      const jsonString = cleanText.substring(jsonStart, jsonEnd + 1);
      
      try {
        const result = JSON.parse(jsonString);

        // Validate result
        if (!result.documentType || result.documentType.length < 5) {
          console.warn('Invalid documentType');
          continue;
        }

        // Ensure all arrays exist
        result.keyTerms = Array.isArray(result.keyTerms) && result.keyTerms.length > 0
          ? result.keyTerms
          : [{ term: "Review Required", explanation: "Please review document" }];

        result.riskyClausesList = Array.isArray(result.riskyClausesList) && result.riskyClausesList.length > 0
          ? result.riskyClausesList
          : [{ clause: "Full review needed", risk: "Seek legal advice" }];

        result.recommendations = Array.isArray(result.recommendations) && result.recommendations.length > 0
          ? result.recommendations
          : ["Consult a lawyer", "Read carefully"];

        result.riskLevel = result.riskLevel || 'MEDIUM';

        console.log('✅ SUCCESSFULLY PARSED RESULT');
        console.log('Document Type:', result.documentType);
        console.log('Risk Level:', result.riskLevel);
        console.log('Key Terms Count:', result.keyTerms.length);
        
        return result;

      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.log('Failed JSON string:', jsonString);
        continue;
      }

    } catch (error) {
      console.error(`${model.name} error:`, error);
      lastError = error.message;
      continue;
    }
  }

  // All models failed
  throw new Error(`All models failed. Last error: ${lastError}\n\nPlease:\n1. Get a NEW API key from https://aistudio.google.com/app/apikey\n2. Make sure to select "Create API key in new project"\n3. Replace the API_KEY in geminiService.js`);
}