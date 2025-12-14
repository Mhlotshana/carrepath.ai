import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Subject, ResourceCategory } from "../types";
import { INSTITUTIONS, FUNDING_SOURCES } from '../constants/institutions';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. Extract Matric Data from Image/PDF
export const extractMatricData = async (base64Data: string, mimeType: string): Promise<{ subjects: Subject[]; name?: string; idNumber?: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Analyze this South African matric certificate or report card. Extract the student's name, ID number (if visible), and a list of subjects with their percentage marks. Return valid JSON."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            idNumber: { type: Type.STRING },
            subjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  mark: { type: Type.NUMBER },
                  level: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Extraction error:", error);
    throw new Error("Failed to extract data. Please try manual entry.");
  }
};

// 2. Analyze Profile and Generate Recommendations
export const analyzeProfile = async (subjects: Subject[], aps: number): Promise<AnalysisResult> => {
  // CACHE CHECK: Create a simple signature based on subjects and APS
  const cacheKey = `cp_analysis_${aps}_${JSON.stringify(subjects.map(s => s.name + s.mark).sort())}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    console.log("Serving from cache ⚡");
    return JSON.parse(cached);
  }

  // Analyze specific subject constraints for better prompting
  const hasPureMaths = subjects.some(s => s.name.toLowerCase().trim() === 'mathematics');
  const hasMathsLit = subjects.some(s => s.name.toLowerCase().includes('mathematical literacy'));
  const mathSubject = subjects.find(s => s.name.toLowerCase().includes('math'));
  const mathLevel = mathSubject ? mathSubject.level : 0;

  const hasPhysics = subjects.some(s => s.name.toLowerCase().includes('physical science'));
  const physicsLevel = subjects.find(s => s.name.toLowerCase().includes('physical science'))?.level || 0;

  const englishLevel = subjects.find(s => s.name.toLowerCase().includes('english'))?.level || 0;

  // Determine Strategy based on APS and Subjects
  let strategyHint = "";

  if (aps < 20) {
    strategyHint = "CRITICAL STRATEGY: The APS is very low (< 20). DO NOT suggest University Degrees. Focus EXCLUSIVELY on TVET Colleges (NCV/NATED courses), Bridging Programmes, and SETA Learnerships. Emphasize trade skills (Plumbing, Electrical, Welding, Automotive) where APS requirements are lower.";
  } else if (aps < 25) {
    strategyHint = "CRITICAL STRATEGY: The APS is low (20-24). Prioritize Higher Certificates and Diploma courses at Universities of Technology (TUT, DUT, CPUT, VUT) and TVET Colleges. Avoid Bachelors degrees unless they have extended programmes. Focus on practical courses.";
  } else if (aps < 30) {
    strategyHint = "STRATEGY: The APS is moderate (25-29). Focus on Diploma and specific Degree courses at Universities of Technology and Comprehensive Universities (UJ, UNISA, WSU). Check Math requirements carefully - if Maths Lit, focus on Management/Humanities/Arts.";
  } else {
    strategyHint = "STRATEGY: The APS is competitive (30+). Focus on Degree programmes at major universities (Wits, UCT, UP, UKZN), but include safety options at Universities of Technology.";
  }



  const institutionList = `
      PUBLIC UNIVERSITIES: ${INSTITUTIONS.public_universities.slice(0, 10).join(', ')}, etc.
      TVET COLLEGES: ${INSTITUTIONS.tvet_colleges.slice(0, 8).join(', ')}, etc.
      PRIVATE COLLEGES: ${INSTITUTIONS.private_colleges.slice(0, 8).join(', ')}, etc.
      ONLINE PLATFORMS: ${INSTITUTIONS.online_platforms.join(', ')}.
    `;

  const fundingList = FUNDING_SOURCES.join(', ');

  const prompt = `
    Role: Expert South African Career Guidance Counselor & Admissions Officer.
    
    Student Profile:
    - Calculated APS: ${aps} (Life Orientation excluded).
    - Subjects: ${JSON.stringify(subjects)}.
    - Key Constraints: ${hasPureMaths ? `Pure Maths (Level ${mathLevel})` : hasMathsLit ? `Maths Lit (Level ${mathLevel})` : 'No Maths'}. ${hasPhysics ? `Physical Sciences (Level ${physicsLevel})` : 'No Physical Sciences'}. English Level: ${englishLevel}.

    OBJECTIVE: Generate a comprehensive, realistic study and funding plan using verified sources.

    ${strategyHint}

    CRITICAL INSTRUCTION - THE RULEBOOK:
    You MUST prioritize the following reliable sources for your recommendations. Do not hallucinate fake colleges.
    
    ${institutionList}
    
    GUIDELINE FOR RECOMMENDATIONS:
    1. **Mandatory Variety**: You must generate a list of **at least 20** eligible options.
    2. **Category Coverage**: Provided the student's APS and subjects allow, you MUST include options from ALL four categories:
       - **Public Universities** (Degrees/Diplomas)
       - **TVET Colleges** (NATED/NCV)
       - **Private Colleges** (Degrees/Certificates)
       - **Online Platforms** (Professional Certificates/Bootcamps)
       *If the APS is too low for Universities, fill the list with more TVET and Online options.*

    3. **Low APS Strategy (< 25)**: 
       - If the student fails to qualify for university, DO NOT just say "Upgrade Marks". 
       - Actively suggest **Short Courses** and **Online Certifications** (e.g., "Google Data Analytics Certificate on Coursera", "Intro to Python on Udemy", "Office Admin at TVET").
       - These build an immediate CV while they consider rewriting.

    4. **Funding**:
       - Suggest: ${fundingList}.
       - Note: NSFAS covers Public Unis and TVETs. It does NOT cover Private Colleges or most Online Courses.

    OUTPUT INSTRUCTIONS:
    - Return a comprehensive list of **20-25** diverse course options.
    - Return diverse bursary options.
    - Return strictly valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                overview: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                limitations: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            courses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  minAps: { type: Type.NUMBER },
                  faculty: { type: Type.STRING },
                  requirements: { type: Type.STRING },
                  applicationDeadline: { type: Type.STRING },
                  applicationLink: { type: Type.STRING },
                  modules: { type: Type.ARRAY, items: { type: Type.STRING } },
                  careerOutcomes: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            bursaries: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  provider: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  closingDate: { type: Type.STRING },
                  link: { type: Type.STRING }
                }
              }
            },
            careers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  entrySalary: { type: Type.STRING },
                  seniorSalary: { type: Type.STRING },
                  growth: { type: Type.STRING, enum: ['High', 'Moderate', 'Stable'] },
                  demand: { type: Type.NUMBER },
                  description: { type: Type.STRING }
                }
              }
            },
            actionPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  deadline: { type: Type.STRING },
                  completed: { type: Type.BOOLEAN },
                  category: { type: Type.STRING, enum: ['Application', 'Documents', 'Funding'] }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No analysis returned");
    const result = JSON.parse(text);

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

// 3. Dynamic Resources Directory
export const getResources = async (): Promise<ResourceCategory[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a curated directory of essential South African higher education resources. \nCategories:\n1. 'Central Applications' (e.g. CAO)\n2. 'Government Funding' (e.g. NSFAS)\n3. 'Top Universities' (List 6 major ones like UCT, Wits, UP with their homepage URLs)\n4. 'Career Advice' (e.g. Khetha, CareerHelp)\n\nReturn valid JSON.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    url: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Resource fetch failed", error);
    return [];
  }
}

// 4. Verify Payment
export const verifyPayment = async (base64Data: string, mimeType: string, expectedId: string): Promise<boolean> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: `Verify if this is a legitimate Proof of Payment document. Look for a reference number containing '${expectedId}' or an amount of R120.00. Return valid JSON.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verified: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result.verified === true;
  } catch (error) {
    console.error("Verification failed", error);
    return false;
  }
};

// 5. Chat
export const createChat = (systemInstruction: string, history: Array<{ role: string, parts: Array<{ text: string }> }> = []) => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: { systemInstruction },
    history: history as any
  });
};