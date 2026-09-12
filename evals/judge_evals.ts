import { limitDataSet, evaleSuite } from "./dataset.js";
import { z } from "zod";
import { Store, loadDataSet, type DataRow } from "../src/semantic.js";
import path from "path";
import { wait } from "./run_evals.js";

const csvPath = path.join(process.cwd(), "static", "Course_Dummy_Data.csv");
import { LLM } from "../src/llm.js";

const dataset = await loadDataSet(csvPath);
const limitedData = limitDataSet(evaleSuite, 8);

export const judgeEvaluationSchema = z.object({
  faithfulnessScore: z
    .number()
    .min(1)
    .max(5)
    .describe(
      "% if strictly grounded in context, 1 if it invents non-existent courses or prices"
    ),
  relevanceScore: z
    .number()
    .min(1)
    .max(5)
    .describe(
      "5 if it directly addresses the student's query, 1 if completely irrelevant"
    ),
  isHallucination: z
    .boolean()
    .describe(
      "True if the response contains any factual claims not backed by the context"
    ),
  reasoning: z
    .string()
    .describe("Brief 1-2 sentence explanation justification the scores."),
});

const buildPrompt = (
  userQuery: string,
  retrievedContext: DataRow[],
  recommendationText: string
): string => {
  const to_string = retrievedContext
    .map(
      (row) =>
        `[
          Id: ${row.id}] 
          Name: ${row.course_name} 
          Description: ${row.description}
          Category: (${row.category}) 
          Level: ${row.level}
          Price: ${row.price}
          Status: ${row.status}
        ]`
    )
    .join("\n");

  return `
    You are an impartial, strict evaluator for an educational course
  recommendation system.

    Your job is to evaluate a GENERATED RECOMMENDATION against the USER QUERY
  and the PROVIDED COURSE CONTEXT.

    [USER QUERY]:
    ${userQuery}

    [PROVIDED COURSE CONTEXT]:
    ${to_string}

    [GENERATED RECOMMENDATION]:
    ${recommendationText}

    Evaluation Rubric:
    1. Faithfulness (1 to 5):
       - 5: Every single claim, price, course title, and topic is 100% grounded
  in the provided context.
       - 1: Mentions courses or prices that do not exist in the context.

    2. Relevance (1 to 5):
       - 5: Perfectly tailored to the student's goal, difficulty level, and
  budget.
       - 1: Fails to answer the student's request.

    3. Edge Case Handling:
       - If the context is empty (no matching courses), the response MUST
  politely state that no courses match the criteria. If it invents a course, set
  faithfulnessScore = 1 and isHallucinating = true.

    Provide your evaluation in the structured format with a clear reasoning.
    `;
};

export async function judge_eval() {
  const llm = new LLM();
  const store = new Store(llm.embeddings);
  await store.addData(dataset);
  for (const element of limitedData) {
    await wait(3000);
    const res = await store.queryData(
      element.userQuery,
      element.expectedLevel,
      element.expectedCategory,
      element.expectedBudget
    );
    const formattedResults = res.map((r: any) => {
      if (r.metadata) {
        return {
          id: r.metadata.id,
          course_name: r.metadata.course_name,
          category: r.metadata.category,
          description: r.content || r.metadata.description || "",
          price: Number(r.metadata.price) || 0,
          level: r.metadata.level,
          status: r.metadata.status,
        };
      }
      return {
        id: r.id,
        course_name: r.course_name,
        category: r.category,
        description: r.description,
        price: Number(r.price) || 0,
        level: r.level,
        status: r.status,
      };
    });
    const recommendation = await llm.generateRecommendation(
      element.userQuery,
      JSON.stringify(formattedResults)
    );
    // console.log(recommendation);
    const judge_prompt = buildPrompt(
      element.userQuery,
      formattedResults,
      recommendation as string
    );
    const judge_res = await llm.invoke(judge_prompt);
    console.log(judge_res);
  }
}
