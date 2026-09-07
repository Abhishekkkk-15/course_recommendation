import type { ContentBlock } from "@langchain/core/messages";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { config } from "dotenv";
import { z } from "zod";
config();

const MODELS = {
  EMBEDDING: "mistral-embed",
  CHAT: "openai/gpt-oss-120b",
};

export const PROMPTS = {
  ANALYZE: (data: string) => {
    return `You are an expert educational counselor and course recommendation assistant.
Your task is to analyze the student query and extract structured search parameters to query our course database accurately.

Available Categories:
- "CA" (Chartered Accountancy preparation and subjects)
- "CS" (Company Secretary preparation and subjects)
- "CMA" (Cost and Management Accounting preparation and subjects)
- "Certification" (Practical certifications like GST, Taxation, Compliance)
- "Finance" (Financial Modelling, Investment Banking, Corporate Finance, Excel for Finance)
- "Technology" (Programming, Python, AI, Generative AI, Power BI, Business Analytics)
- "All" (Use if the query does not specify any specific domain or spans multiple)

Available Levels:
- "Beginner" (Introductory, fundamentals, foundation, starter)
- "Intermediate" (Intermediate, group 1/2, executive, practical application)
- "Advanced" (Advanced concepts, mastery, specialized topics)
- "All" (Use if the student did not specify or imply a level)

Extraction Guidelines:
1. category: Select the most accurate category from the list above. If ambiguous or not mentioned, return "All".
2. level: Select the appropriate level ("Beginner", "Intermediate", "Advanced", or "All").
3. semantic_query: Extract the core learning topics, skills, technologies, or keywords optimized for vector similarity search. Remove conversational filler (e.g. "I want to learn", "recommend me courses for", "under 5000", "cheap").
4. max_price: If the student specified a budget limit (e.g., "under 5000", "below 10k", "max ₹6000"), extract it as a numeric value (e.g. 5000, 10000, 6000). If no price limit is mentioned, return null.
5. show_all: If the student explicitly requests to see all courses regardless of filters (e.g., "show me all courses", "I want to see everything"), set this to true. Otherwise, set it to false, its boolean value not a string.

Student Query:
"""
${data}
"""`;
  },
  QUERY: (query: string, context?: string) => {
    return `You are a knowledgeable, supportive, and friendly academic advisor helping students find the best courses from our catalog.

Instructions:
1. Carefully review the provided course catalog information below and recommend the best matching courses for the student's query.
2. For each recommended course, include:
   - Course Name and Category
   - Difficulty Level and Price
   - Key topics covered and why it fits the student's specific goal
3. If no course perfectly matches the criteria (or budget), explain the situation politely and suggest the closest available alternatives.
4. Keep your response clear, well-structured, encouraging, and easy to read.
5. Strictly base your recommendations on the provided course data. Do not make up non-existent courses, pricing and other information.
6. Keep responses concise, ideally under 150 words, while still being informative and helpful.
Student Query:
${query}

${context ? `Available Courses Context:\n${context}` : ""}`;
  },
};

export const ResponseSchema = z.object({
  category: z
    .enum(["CA", "CS", "CMA", "Certification", "Finance", "Technology", "All"])
    .describe(
      "The most relevant course category: CA, CS, CMA, Certification, Finance, Technology, or All if unspecified.",
    ),
  level: z
    .enum(["Beginner", "Intermediate", "Advanced", "All"])
    .describe(
      "The course difficulty level: Beginner, Intermediate, Advanced, or All if unspecified.",
    ),
  semantic_query: z
    .string()
    .describe(
      "A cleaned, keyword-rich search phrase stripped of budget/filler words, optimized for semantic embedding search.",
    ),
  max_price: z
    .number()
    .nullable()
    .describe(
      "The maximum price/budget as a number if mentioned by the user (e.g. 5000), or null if unconstrained.",
    ),
  show_all: z
    .stringbool()
    .describe(
      "Indicates if the user wants to see all courses regardless of filters.",
    ),
});

export type AnalyzedQuery = z.infer<typeof ResponseSchema>;

export class LLM {
  private client: ChatOpenAI;
  embeddings: OpenAIEmbeddings;
  constructor() {
    this.client = new ChatOpenAI({
      model: MODELS.CHAT,
      temperature: 0,
      apiKey: process.env.CHAT_API_KEY || "",
      configuration: {
        baseURL:
          process.env.OPENAI_API_BASE_URL || "https://api.groq.com/openai/v1",
      },
    });
    this.embeddings = new OpenAIEmbeddings({
      modelName: MODELS.EMBEDDING,
      apiKey: process.env.OPENAI_API_KEY || "",
      configuration: {
        baseURL: process.env.OPENAI_API_BASE_URL || "https://api.mistral.ai/v1",
      },
    });
  }

  async analyzeAgent(query: string): Promise<AnalyzedQuery> {
    const prompt = PROMPTS.ANALYZE(query);
    if (!this.client) {
      throw new Error("OpenAI client is not initialized.");
    }
    const llm = this.client.withStructuredOutput(ResponseSchema);
    const response = await llm.invoke(prompt);

    return response;
  }

  async generateRecommendation(
    query: string,
    context: string,
  ): Promise<string | (ContentBlock | Text)[]> {
    const prompt = PROMPTS.QUERY(query, context);
    if (!this.client) {
      throw new Error("OpenAI client is not initialized.");
    }
    const response = await this.client.invoke(prompt);
    return response.content;
  }
}
