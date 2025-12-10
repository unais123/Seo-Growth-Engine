import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { AuditResult, CodeAnalysis, KeywordData, BusinessDetails } from "../types";

// Initialize Gemini Client
// Using the provided key as a fallback if process.env.API_KEY is not set
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'AIzaSyB1iVAhxXUpDsD58lM3J7xMbUvgQfOd4W8' });

const auditSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    scores: {
      type: Type.OBJECT,
      properties: {
        basic: { type: Type.INTEGER },
        technical: { type: Type.INTEGER },
        advanced: { type: Type.INTEGER },
        aeo: { type: Type.INTEGER },
        geo: { type: Type.INTEGER },
      },
      required: ["basic", "technical", "advanced", "aeo", "geo"]
    },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
          status: { type: Type.STRING, enum: ["Pass", "Fail", "Warning"] },
          category: { type: Type.STRING, enum: ["Basic", "Technical", "Advanced", "AEO", "GEO"] },
          solution: { type: Type.STRING, description: "Detailed fix with code example or specific action." },
        },
        required: ["title", "description", "impact", "status", "category", "solution"]
      }
    },
    blogIdeas: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    keywords: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          keyword: { type: Type.STRING },
          intent: { type: Type.STRING, enum: ["Informational", "Commercial", "Transactional", "Navigational"] },
          difficulty: { type: Type.STRING, enum: ["Hard", "Medium", "Easy"] },
          volume: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
        },
        required: ["keyword", "intent", "difficulty", "volume"]
      }
    },
    backlinks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          description: { type: Type.STRING },
          example: { type: Type.STRING }
        },
        required: ["type", "description", "example"]
      }
    }
  },
  required: ["summary", "scores", "recommendations", "blogIdeas", "keywords", "backlinks"]
};

export const runAudit = async (input: string, mode: 'URL' | 'CODE', bizDetails?: BusinessDetails): Promise<AuditResult> => {
  const modelId = "gemini-2.5-flash";
  
  const businessContext = bizDetails ? `
  BUSINESS CONTEXT (Tailor audit to this):
  - Name: ${bizDetails.name}
  - Industry: ${bizDetails.industry}
  - Location: ${bizDetails.location}
  - Services: ${bizDetails.keywords}
  ` : '';

  const commonInstructions = `
    Perform a comprehensive SEO Audit. 
    IMPORTANT: You must return BOTH passing items (what they did right) and failing items (what to fix).
    For every 'Fail' or 'Warning', provide a specific SOLUTION with an EXAMPLE (e.g., "Change <title> to 'X'", or "Add Schema JSON: {...}").

    Categorize items strictly into:
    1. Basic: Titles, Metas, Headings, Alt tags.
    2. Technical: Speed, Mobile, HTTPS, Robots.txt, Sitemap, Core Web Vitals.
    3. Advanced: E-E-A-T, Content Depth, Topic Clusters, Internal Linking.
    4. AEO: Answer Engine Optimization, Featured Snippets, Voice Search, Q&A format.
    5. GEO: Local SEO, Google Business Profile, Local Schema, NAP consistency.

    Scores should reflect the ratio of Passed vs Failed items in that category.
  `;

  let prompt = "";
  if (mode === 'URL') {
    prompt = `
    ${businessContext}
    Analyze this website URL contextually: ${input}. 
    ${commonInstructions}
    
    Simulate a full crawl based on public knowledge or general best practices for this domain.
    Include at least 5 items per category (Basic, Technical, Advanced, AEO, GEO).
    `;
  } else {
    prompt = `
    ${businessContext}
    Analyze this provided WEBSITE SOURCE CODE contextually:
    SOURCE CODE START:
    ${input.substring(0, 50000)} 
    SOURCE CODE END.

    ${commonInstructions}
    Treat this as a full technical code audit.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: auditSchema
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from Gemini");
    
    return JSON.parse(resultText) as AuditResult;
  } catch (error) {
    console.error("Audit failed:", error);
    throw error;
  }
};

export const generateBlogPost = async (topic: string, context: string): Promise<string> => {
  const modelId = "gemini-2.5-flash";
  const prompt = `Write a comprehensive, SEO-optimized blog post about "${topic}".
  Context: ${context.substring(0, 500)}...
  
  Requirements:
  - Optimized Title and Meta Description.
  - H1, H2, H3 structure.
  - Include an "AEO" section (Question & Answer block).
  - Internal link suggestions.
  - FAQ section with Schema markup JSON-LD at the end.
  - Tone: Professional, authoritative, yet easy to read.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });
    return response.text || "Failed to generate blog.";
  } catch (error) {
    console.error("Blog gen failed", error);
    throw error;
  }
};

export const fixCodeBlock = async (code: string, issues: string): Promise<CodeAnalysis> => {
  const modelId = "gemini-2.5-flash";
  const prompt = `Here is the original code:
  \`\`\`
  ${code}
  \`\`\`
  
  Based on the SEO audit issues found: ${issues}
  
  1. Fix the code to adhere to SEO, AEO, and GEO best practices (add titles, metas, semantic tags, schema, etc).
  2. Explain the changes briefly.
  
  Return the response in JSON format.
  `;

  const codeFixSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      issues: { type: Type.ARRAY, items: { type: Type.STRING } },
      fixedCode: { type: Type.STRING },
      explanation: { type: Type.STRING }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: codeFixSchema
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Code fix failed", error);
    throw error;
  }
};

export const researchKeywords = async (seed: string): Promise<KeywordData[]> => {
  const modelId = "gemini-2.5-flash";
  const prompt = `Act as an SEO expert. Perform keyword research for the seed keyword: "${seed}".
  Generate 10 highly relevant related keywords including long-tail variations.
  For each, determine the Search Intent, Difficulty Level (Easy/Medium/Hard), and Estimated Search Volume (Low/Medium/High).
  Return the result as a JSON array.`;

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        keyword: { type: Type.STRING },
        intent: { type: Type.STRING, enum: ["Informational", "Commercial", "Transactional", "Navigational"] },
        difficulty: { type: Type.STRING, enum: ["Hard", "Medium", "Easy"] },
        volume: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
      },
      required: ["keyword", "intent", "difficulty", "volume"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const resultText = response.text;
    if (!resultText) return [];
    
    return JSON.parse(resultText) as KeywordData[];
  } catch (error) {
    console.error("Keyword research failed:", error);
    throw error;
  }
};