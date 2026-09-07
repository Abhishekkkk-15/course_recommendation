import { describe, it, expect } from "vitest";
import { PROMPTS, ResponseSchema } from "../src/llm";

describe("LLM ResponseSchema validation", () => {
  it("should pass for valid structured LLM output", () => {
    const validData = {
      category: "Technology",
      level: "Beginner",
      semantic_query: "Python programming basics",
      max_price: 5000,
      show_all: false,
    };

    const parsed = ResponseSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it("should allow max_price to be null when buget is not available", () => {
    const data = {
      category: "Technology",
      level: "Beginner",
      semantic_query: "Python programming basics",
      max_price: null,
      show_all: false,
    };
    const parsed = ResponseSchema.safeParse(data);
    expect(parsed.success).toBe(true);
  });

  it("should fail on invalid category", () => {
    const data = {
      category: "Cooking",
      level: "Beginner",
      semantic_query: "Baking",
      max_price: null,
      show_all: false,
    };
    const parsed = ResponseSchema.safeParse(data);
    expect(parsed.success).toBe(false);
  });

  it("should embed user query into prompt template", () => {
    const analyzePrompt = PROMPTS.ANALYZE("I want to learn Generative AI");
    expect(analyzePrompt).toContain("I want to learn Generative AI");
    expect(analyzePrompt).toContain("Available Categories:");
  });
});
