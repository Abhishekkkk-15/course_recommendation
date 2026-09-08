import { evaleSuite, limitDataSet } from "./dataset.js";
import { LLM } from "../src/llm.js";
import { Store, loadDataSet } from "../src/semantic.js";
import path from "path";
import { wait } from "./run_evals.js";

const csvPath = path.join(process.cwd(), "static", "Course_Dummy_Data.csv");

type TRetrivalMetrics = {
  recall: number;
  // Mean Reciprocal Rank (MRR)
  mrr: number;
};

const llm = new LLM();
const store = new Store(llm.embeddings);

const dataset = await loadDataSet(csvPath);

export const metrics: TRetrivalMetrics = {
  recall: 0,
  mrr: 0,
};

const limitedData = limitDataSet(evaleSuite, 16);

export async function run() {
  await store.addData(dataset);

  let totalRecallScore = 0;
  let totalMRRScore = 0;
  for (const element of limitedData) {
    try {
      await wait(1000);
      const res = await store.queryData(
        element.userQuery,
        element.expectedLevel,
        element.expectedCategory,
        element.expectedBudget,
      );

      const retrievedIds: string[] = res.map((e) => String(e.metadata.id));
      const expectedIdStr =
        element.expectedId !== null ? String(element.expectedId) : "None";

      let found = false;
      let reciporalRank = 0;

      if (element.expectedId !== null) {
        const foundRank = retrievedIds.indexOf(String(element.expectedId));
        if (foundRank !== -1) {
          found = true;
          reciporalRank = 1 / (foundRank + 1);
        }
      } else {
        if (retrievedIds.length === 0 || element.expectedShowAll) {
          found = true;
          reciporalRank = 1.0;
        }
      }

      const queryRecall = found ? 1 : 0;

      totalRecallScore += queryRecall;
      totalMRRScore += reciporalRank;
      console.log(
        `Query: "${element.userQuery}" | Expected: ${expectedIdStr} | Found: ${found} | Reciprocal Rank: ${reciporalRank.toFixed(2)}`,
      );
    } catch (error) {
      console.error("Error processing query:", error);
    }
  }

  metrics.recall =
    limitedData.length > 0 ? totalRecallScore / limitedData.length : 0;
  metrics.mrr = limitedData.length > 0 ? totalMRRScore / limitedData.length : 0;
  console.log("Final Evaluated Metrics:", {
    recall: `${(metrics.recall * 100).toFixed(2)}%`,
    mrr: `${(metrics.mrr * 100).toFixed(2)}% (Score: ${metrics.mrr.toFixed(3)})`,
  });
}
