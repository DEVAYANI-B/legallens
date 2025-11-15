
import Tesseract from 'tesseract.js';
import mammoth from 'mammoth';
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.js`;



export async function extractTextFromFile(file) {
  try {
    console.log('Starting text extraction for:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    // Handle TXT files
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      console.log('Processing as TXT file');
      return await extractFromTxt(file);
    }
    
    // Handle PDF files
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      console.log('Processing as PDF file');
      return await extractFromPdf(file);
    }
    
    // Handle DOCX files
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
      console.log('Processing as DOCX file');
      return await extractFromDocx(file);
    }
    
    // Handle DOC files (older format)
    if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
      console.log('Processing as DOC file');
      return await extractFromDocx(file); // Try with mammoth
    }
    
    // Handle Image files (PNG, JPG, JPEG)
    if (fileType.startsWith('image/')) {
      console.log('Processing as Image file');
      return await extractFromImage(file);
    }
    
    throw new Error('Unsupported file type. Please use TXT, PDF, DOCX, or Image files.');
    
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

// Extract text from TXT files
async function extractFromTxt(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target.result;
      if (text && text.trim().length > 0) {
        console.log('TXT extracted, length:', text.length);
        resolve(text);
      } else {
        reject(new Error('File is empty'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read TXT file'));
    reader.readAsText(file);
  });
}

// Extract text from PDF files
async function extractFromPdf(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    console.log(`PDF has ${pdf.numPages} pages`);
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
      
      console.log(`Extracted page ${pageNum}/${pdf.numPages}`);
    }
    
    if (fullText.trim().length < 50) {
      throw new Error('Could not extract sufficient text from PDF. The PDF might be scanned or image-based.');
    }
    
    console.log('PDF extraction complete, length:', fullText.length);
    return fullText;
    
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
}

// Extract text from DOCX files
async function extractFromDocx(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    const text = result.value;
    
    if (!text || text.trim().length < 50) {
      throw new Error('Could not extract sufficient text from DOCX file');
    }
    
    console.log('DOCX extraction complete, length:', text.length);
    return text;
    
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error(`DOCX extraction failed: ${error.message}`);
  }
}

// Extract text from Image files using OCR
async function extractFromImage(file) {
  try {
    console.log('Starting OCR on image...');
    
    const { data: { text } } = await Tesseract.recognize(
      file,
      'eng+hin+tam', // English + Hindi + Tamil
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );
    
    if (!text || text.trim().length < 50) {
      throw new Error('Could not extract sufficient text from image. Please ensure the image is clear and contains readable text.');
    }
    
    console.log('Image OCR complete, length:', text.length);
    return text;
    
  } catch (error) {
    console.error('Image OCR error:', error);
    throw new Error(`Image OCR failed: ${error.message}`);
  }
}

// Utility: Get file size in MB
export function getFileSizeMB(file) {
  return (file.size / (1024 * 1024)).toFixed(2);
}

// Utility: Validate file
export function validateFile(file, maxSizeMB = 16) {
  const sizeMB = parseFloat(getFileSizeMB(file));
  
  if (sizeMB > maxSizeMB) {
    throw new Error(`File size (${sizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`);
  }
  
  const allowedTypes = [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ];
  
  const allowedExtensions = ['.txt', '.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg'];
  
  const fileExtension = file.name.toLowerCase().match(/\.\w+$/)?.[0];
  
  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    throw new Error('Unsupported file type. Please use TXT, PDF, DOCX, or Image files.');
  }
  
  return true;
}