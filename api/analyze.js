import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Import constants (need to copy these or reorganize)
const INSTITUTIONS = {
    public_universities: ["UCT", "Wits", "UP", "Stellenbosch", "UKZN", "UJ", "UNISA", "UWC", "Rhodes", "NWU"],
    tvet_colleges: ["Majuba TVET", "Orbit College", "False Bay College", "Coastal KZN", "Ekurhuleni East", "Westcol", "South West Gauteng", "Buffalo City"],
    private_colleges: ["Rosebank College", "Vega School", "STADIO", "Richfield", "Boston City Campus", "CTI", "Damelin", "IMM GSM"],
    online_platforms: ["Coursera", "Udemy", "Google Career Certificates", "edX", "LinkedIn Learning", "Udacity"]
};

const FUNDING_SOURCES = ["NSFAS", "Funza Lushaka", "Investec", "Allan Gray Orbis Foundation", "Ikusasa Student Financial Aid Programme (ISFAP)"];

const DEADLINE_GUIDE = {
    universities: "Most Public Universities open: April 1st. Close: September 30th. Medicine/Architecture often close earlier (June/July).",
    tvet_colleges: "TVET Colleges run by Trimester/Semester. Trimester 1: Apply Sept-Nov for next year. Trimester 2: Apply March/April. Trimester 3: Apply July/August.",
    financial_aid: "NSFAS: Opens Oct/Nov. Closes Jan/Feb. Bursaries vary widely.",
    private_colleges: "Private Colleges (Rosebank, Vega, etc.) are generally open until Feb (Late Applications) but filling fast."
};

const SPECIFIC_CLOSING_DATES = {
    "University of Cape Town (UCT)": "31 July (Undergrad)",
    "University of the Witwatersrand (Wits)": "30 September",
    "University of Pretoria (UP)": "30 June (Selection programmes), 30 Sept (others)",
    "Stellenbosch University": "31 July",
    "University of KwaZulu-Natal (UKZN)": "30 September",
    "University of Johannesburg (UJ)": "30 September (12pm)",
    "Rosebank College": "Open until Feb",
    "Boston City Campus": "Open all year",
    "Richfield": "Open until Feb"
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { subjects, aps } = req.body;

        if (!subjects || !aps) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Build prompt (same logic as client)
        const hasPureMaths = subjects.some(s => s.name.toLowerCase().trim() === 'mathematics');
        const hasMathsLit = subjects.some(s => s.name.toLowerCase().includes('mathematical literacy'));
        const mathSubject = subjects.find(s => s.name.toLowerCase().includes('math'));
        const mathLevel = mathSubject ? mathSubject.level : 0;
        const hasPhysics = subjects.some(s => s.name.toLowerCase().includes('physical science'));
        const physicsLevel = subjects.find(s => s.name.toLowerCase().includes('physical science'))?.level || 0;
        const englishLevel = subjects.find(s => s.name.toLowerCase().includes('english'))?.level || 0;

        let strategyHint = "";
        if (aps < 20) {
            strategyHint = "CRITICAL STRATEGY: The APS is very low (<20). DO NOT suggest University Degrees. Focus EXCLUSIVELY on TVET Colleges (NCV/NATED courses), Bridging Programmes, and SETA Learnerships.";
        } else if (aps < 25) {
            strategyHint = "CRITICAL STRATEGY: The APS is low (20-24). Prioritize Higher Certificates and Diploma courses at Universities of Technology and TVET Colleges.";
        } else if (aps < 30) {
            strategyHint = "STRATEGY: The APS is moderate (25-29). Focus on Diploma and specific Degree courses at Universities of Technology.";
        } else {
            strategyHint = "STRATEGY: The APS is competitive (30+). Focus on Degree programmes at major universities.";
        }

        const institutionList = `
      PUBLIC UNIVERSITIES: ${INSTITUTIONS.public_universities.slice(0, 10).join(', ')}, etc.
      TVET COLLEGES: ${INSTITUTIONS.tvet_colleges.slice(0, 8).join(', ')}, etc.
      PRIVATE COLLEGES: ${INSTITUTIONS.private_colleges.slice(0, 8).join(', ')}, etc.
      ONLINE PLATFORMS: ${INSTITUTIONS.online_platforms.join(', ')}.
    `;

        const fundingList = FUNDING_SOURCES.join(', ');
        const today = new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });

        const deadlineContext = `
      CURRENT DATE: ${today}.
      STANDARD DEADLINES: ${DEADLINE_GUIDE.universities}
      TVET: ${DEADLINE_GUIDE.tvet_colleges}
      Specific: ${JSON.stringify(SPECIFIC_CLOSING_DATES)}
      INSTRUCTION: If a deadline has passed, warn the student.
    `;

        const prompt = `
      Role: Expert South African Career Guidance Counselor & Admissions Officer.
      
      Student Profile:
      - Calculated APS: ${aps} (Life Orientation excluded).
      - Subjects: ${JSON.stringify(subjects)}.
      - Key Constraints: ${hasPureMaths ? `Pure Maths (Level ${mathLevel})` : hasMathsLit ? `Maths Lit (Level ${mathLevel})` : 'No Maths'}. ${hasPhysics ? `Physical Sciences (Level ${physicsLevel})` : 'No Physical Sciences'}. English Level: ${englishLevel}.

      OBJECTIVE: Generate a comprehensive, realistic study and funding plan using verified sources.
      
      ${deadlineContext}
      ${strategyHint}

      CRITICAL INSTRUCTION - THE RULEBOOK:
      You MUST prioritize the following reliable sources. Do not hallucinate fake colleges.
      ${institutionList}
      
      GUIDELINE FOR RECOMMENDATIONS:
      1. **Mandatory Variety**: Generate at least 20 eligible options.
      2. **Category Coverage**: Include options from ALL four categories (Public Universities, TVET, Private, Online).
      3. **Low APS Strategy**: Suggest Short Courses and Online Certifications.
      4. **Funding**: Suggest: ${fundingList}. Note: NSFAS covers Public Unis and TVETs only.

      OUTPUT: Return 20-25 diverse course options, bursaries, and strictly valid JSON.
    `;

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

        return res.status(200).json(JSON.parse(text));
    } catch (error) {
        console.error("Analysis error:", error);
        return res.status(500).json({ error: 'Failed to analyze profile' });
    }
}
