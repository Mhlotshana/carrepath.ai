import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult, Subject, ResourceCategory } from "../types";

// Detect if we're running locally or in production
const isProduction = !import.meta.env.DEV;

// For local development, use direct API calls
const genAI = !isProduction ? new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY) : null;

// 1. Extract Matric Data - Works locally AND in production
export const extractMatricData = async (base64Data: string, mimeType: string): Promise<{ subjects: Subject[]; name?: string; idNumber?: string }> => {
  // PRODUCTION: Use backend API
  if (isProduction) {
    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data, mimeType })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Extraction failed');
      }

      if (!data.subjects || data.subjects.length < 3) {
        throw new Error('Not enough subjects found. Please ensure the image shows all your results clearly.');
      }

      return data;
    } catch (error) {
      console.error("Extraction error:", error);
      throw new Error("Failed to extract data. Please try manual entry.");
    }
  }

  // LOCAL DEVELOPMENT: Direct API call
  try {
    if (!genAI) throw new Error("AI not initialized");

    const modelsToTry = ["gemini-flash-latest", "gemini-2.0-flash", "gemini-2.0-flash-001", "gemini-2.5-flash"];
    let lastError;
    let resultResponse;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[LOCAL-EXTRACT] Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });
        resultResponse = await model.generateContent([
          { inlineData: { mimeType, data: base64Data } },
          "Analyze this South African matric certificate. Extract student name, ID number, and ALL subjects with percentage marks. Include at least 6 subjects. Return valid JSON."
        ]);

        if (resultResponse && resultResponse.response) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[LOCAL-EXTRACT] Model ${modelName} failed:`, err.message);
        if (err.message.includes("404") || err.message.includes("400")) {
          continue;
        }
        break;
      }
    }

    if (!resultResponse) throw lastError || new Error("All models failed");

    const text = resultResponse.response.text();
    if (!text) throw new Error("No data returned");

    // Robust JSON parsing (handles potential markdown blocks)
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : text;
      return JSON.parse(jsonText);
    } catch (parseError) {
      console.error("JSON Parse failed. Raw text:", text);
      throw new Error("Invalid data format received.");
    }
  } catch (error) {
    console.error("Extraction error:", error);
    throw new Error("Failed to extract data. Please try manual entry.");
  }
};

// 2. Analyze Profile - Works locally AND in production
export const analyzeProfile = async (subjects: Subject[], aps: number): Promise<AnalysisResult> => {
  const cacheKey = `cp_analysis_${aps}_${JSON.stringify(subjects.map(s => s.name + s.mark).sort())}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    console.log("Serving from cache ⚡");
    return JSON.parse(cached);
  }

  // PRODUCTION: Use backend API
  if (isProduction) {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects, aps })
      });

      if (!response.ok) throw new Error('Analysis failed');

      const result = await response.json();

      try {
        localStorage.setItem(cacheKey, JSON.stringify(result));
      } catch (e) {
        console.warn("Cache save failed");
      }

      return result;
    } catch (error) {
      console.error("Analysis error:", error);
      throw new Error("Failed to analyze profile.");
    }
  }

  // LOCAL DEVELOPMENT: Direct API call (simplified for demo)
  console.warn("Local mode: Using simplified analysis");
  const mockResult: AnalysisResult = {
    summary: {
      title: `Career Analysis for APS ${aps}`,
      overview: "This is a local development preview. Deploy to Vercel for full AI analysis.",
      strengths: ["Good APS score", "Diverse subjects"],
      limitations: ["Local mode - limited analysis"]
    },
    courses: [
      {
        id: "1",
        institution: "University of Pretoria",
        name: "BCom Accounting",
        type: "Degree",
        duration: "3 years",
        minAps: 30,
        faculty: "Commerce",
        requirements: "Maths or Maths Lit",
        applicationDeadline: "30 September",
        applicationLink: "https://www.up.ac.za",
        modules: ["Financial Accounting", "Management Accounting"],
        careerOutcomes: ["Chartered Accountant", "Financial Manager"]
      }
    ],
    bursaries: [],
    careers: [],
    actionPlan: []
  };

  try {
    localStorage.setItem(cacheKey, JSON.stringify(mockResult));
  } catch (e) {
    console.warn("Cache save failed");
  }

  return mockResult;
};

// 3. Resources
export const getResources = async (): Promise<ResourceCategory[]> => {
  return [
    {
      category: 'Central Applications',
      items: [{ name: 'CAO', description: 'Central Application Office', url: 'https://www.cao.ac.za' }]
    }
  ];
};

// 4. Verify Payment - Works locally AND in production
export const verifyPayment = async (base64Data: string, mimeType: string, expectedId: string): Promise<boolean> => {
  // PRODUCTION: Use backend API
  if (isProduction) {
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data, mimeType, expectedId })
      });

      if (!response.ok) return false;

      const result = await response.json();
      return result.verified === true;
    } catch (error) {
      console.error("Verification failed", error);
      return false;
    }
  }

  // LOCAL DEVELOPMENT: Mock verification
  console.warn("Local mode: Payment verification bypassed");
  return true; // Auto-approve in local dev
};

// 5. Chat
export const createChat = (systemInstruction: string, history: Array<{ role: string, parts: Array<{ text: string }> }> = []) => {
  throw new Error("Chat feature not yet implemented");
};