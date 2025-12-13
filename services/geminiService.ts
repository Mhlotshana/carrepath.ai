import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Subject, ResourceCategory } from "../types";

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

  const prompt = `
    Role: Expert South African Career Guidance Counselor & Admissions Officer.
    
    Student Profile:
    - Calculated APS: ${aps} (Life Orientation excluded).
    - Subjects: ${JSON.stringify(subjects)}.
    - Key Constraints: ${hasPureMaths ? `Pure Maths (Level ${mathLevel})` : hasMathsLit ? `Maths Lit (Level ${mathLevel})` : 'No Maths'}. ${hasPhysics ? `Physical Sciences (Level ${physicsLevel})` : 'No Physical Sciences'}. English Level: ${englishLevel}.

    OBJECTIVE: Generate a comprehensive, realistic study and funding plan.
    
    ${strategyHint}

    DATA SOURCES & LOGIC:
    1. **Courses (Admissions Logic)**: 
       - Source from **CAO**, **Public Universities** (Wits, UCT, UP, UKZN, UJ), **Universities of Technology** (DUT, TUT, CPUT, VUT), and **TVET Colleges** (Orbit, Majuba, False Bay, etc).
       - **Maths Constraint**: If student has **Maths Lit**, DO NOT suggest Engineering (BEng), Medicine (MBChB), Actuarial Science or Science (BSc) degrees that strictly require Pure Maths. Suggest alternatives like BCom (some streams), Humanities, Education, Law, or Diplomas in IT/Management at UoTs.
       - **Science Constraint**: Do not suggest Engineering or Health Science degrees if Physical Science is missing or Level < 4.
       - **TVET Priority**: For APS < 25 or if Maths/Science levels are low (< 4), heavily prioritize TVET vocational courses (Engineering N1-N6, Hospitality, Tourism).
       - **Industry Demand**: Prioritize courses with high employability in SA: IT/Software, Data Analysis, Renewable Energy (Solar/Wind), Teachers (BEd), Nursing, Finance, and Artisans (Electricians, Plumbers, Millwrights).
       - **Deadlines**: Include realistic application closing dates (e.g., "30 Sept" for Universities, "Rolling" for TVETs).
       - **Links**: Provide valid URLs to application portals (e.g., 'https://www.cao.ac.za', 'https://www.unisa.ac.za/apply').

    2. **Bursaries**:
       - Include NSFAS (mandatory for <R350k income), Funza Lushaka (Teaching), ISFAP (Missing Middle), and relevant private bursaries (e.g. Investec, Sasol - ONLY if marks are high).

    3. **Careers**:
       - Align with the suggested courses and current SA skills shortage list.

    OUTPUT INSTRUCTIONS:
    - Return exactly 12 diverse course options (Mix of Degree/Diploma/Higher Cert based on APS logic above).
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
    return JSON.parse(text);
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