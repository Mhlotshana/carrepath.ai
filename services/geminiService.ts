import { AnalysisResult, Subject, ResourceCategory } from "../types";

// All Gemini API calls now happen on the backend for security
// The API key is only stored on the server, never exposed to the browser

// 1. Extract Matric Data from Image/PDF (Backend API with retry logic)
export const extractMatricData = async (base64Data: string, mimeType: string, retries = 2): Promise<{ subjects: Subject[]; name?: string; idNumber?: string }> => {
  try {
    const response = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data, mimeType })
    });

    const data = await response.json();

    if (!response.ok) {
      // Check for specific error types
      if (response.status === 500 && data.details?.includes('API key')) {
        throw new Error('CONFIGURATION_ERROR: API key not set up. Please contact support.');
      }
      if (response.status === 400 && data.details?.includes('Insufficient')) {
        throw new Error(`QUALITY_ERROR: ${data.details}`);
      }
      throw new Error(data.details || data.error || 'Extraction failed');
    }

    // Extra validation on client side
    if (!data.subjects || data.subjects.length < 3) {
      throw new Error('VALIDATION_ERROR: Not enough subjects found. Please ensure the image shows all your results clearly.');
    }

    return data;

  } catch (error) {
    console.error("Extraction error:", error);

    // Retry logic for network errors (but not for quality/validation errors)
    if (retries > 0 && !error.message.includes('ERROR:')) {
      console.warn(`Retrying extraction (${retries} attempts left)...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      return extractMatricData(base64Data, mimeType, retries - 1);
    }

    // Provide user-friendly error messages
    if (error.message.includes('CONFIGURATION_ERROR')) {
      throw new Error("System configuration issue. Please contact support or use manual entry.");
    }
    if (error.message.includes('QUALITY_ERROR') || error.message.includes('VALIDATION_ERROR')) {
      throw error; // Pass through quality errors as-is
    }

    throw new Error("Failed to extract data. This could be due to image quality, format, or network issues. Please try:\n• A clearer photo\n• Better lighting\n• Manual entry");
  }
};

// 2. Analyze Profile and Generate Recommendations (Backend API with client-side caching)
export const analyzeProfile = async (subjects: Subject[], aps: number): Promise<AnalysisResult> => {
  // CACHE CHECK: Create a simple signature based on subjects and APS
  const cacheKey = `cp_analysis_${aps}_${JSON.stringify(subjects.map(s => s.name + s.mark).sort())}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    console.log("Serving from cache ⚡");
    return JSON.parse(cached);
  }

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjects, aps })
    });

    if (!response.ok) {
      throw new Error('Analysis failed');
    }

    const result = await response.json();

    // Save to Cache
    try {
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (e) {
      console.warn("Quota exceeded for localStorage");
    }

    return result;
  } catch (error) {
    console.error("Analysis error:", error);
    throw new Error("Failed to analyze profile.");
  }
};

// 3. Dynamic Resources Directory (Keep client-side for now as it's lightweight)
export const getResources = async (): Promise<ResourceCategory[]> => {
  // For now, return static resources to avoid unnecessary API calls
  return [
    {
      category: 'Central Applications',
      items: [
        { name: 'CAO', description: 'Central Application Office', url: 'https://www.cao.ac.za' }
      ]
    },
    {
      category: 'Government Funding',
      items: [
        { name: 'NSFAS', description: 'National Student Financial Aid Scheme', url: 'https://www.nsfas.org.za' }
      ]
    }
  ];
};

// 4. Verify Payment (Backend API)
export const verifyPayment = async (base64Data: string, mimeType: string, expectedId: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data, mimeType, expectedId })
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.verified === true;
  } catch (error) {
    console.error("Verification failed", error);
    return false;
  }
};

// 5. Chat (Not implemented yet - would need backend websocket for production)
export const createChat = (systemInstruction: string, history: Array<{ role: string, parts: Array<{ text: string }> }> = []) => {
  throw new Error("Chat feature not yet implemented in production mode");
};