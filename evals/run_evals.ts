import { evaleSuite, type TEvaleSuite } from "./dataset.js";
import { type AnalyzedQuery, LLM } from "../src/llm.js";
import { run } from "./retrival_evals.js";
import { metrics as retrivalMetrics } from "./retrival_evals.js";
const llm = new LLM();

export async function wait(time: number): Promise<void> {
  return new Promise((res, rej) =>
    setTimeout(() => {
      res();
    }, time),
  );
}

type TMatrics = {
  categoryAccuracy: number;
  levelAccuracy: number;
  priceAccuracy: number;
  show_all: number;
};

const LENGTH = evaleSuite.length;

let metrics: TMatrics = {
  categoryAccuracy: 0,
  levelAccuracy: 0,
  priceAccuracy: 0,
  show_all: 0,
};

async function run_suite() {
  for (const element of evaleSuite) {
    await wait(1000);
    try {
      const res = await llm.analyzeAgent(element.userQuery);
      const valid_res = validate(element, res);
      metrics.categoryAccuracy += valid_res.categoryAccuracy;
      metrics.levelAccuracy += valid_res.levelAccuracy;
      metrics.priceAccuracy += valid_res.priceAccuracy;
      metrics.show_all += valid_res.show_all;
      const isPassing =
        valid_res.categoryAccuracy &&
        valid_res.levelAccuracy &&
        valid_res.priceAccuracy;

      if (!isPassing) {
        console.log(`❌ Failed: "${element.userQuery}"`);
        if (!valid_res.categoryAccuracy) {
          if (!valid_res.categoryAccuracy) {
            console.log(
              `   Category -> Expected: ${element.expectedCategory} | Got: ${res.category}`,
            );
          }
          if (!valid_res.levelAccuracy) {
            console.log(
              `   Level    -> Expected: ${element.expectedLevel} | Got: ${res.level}`,
            );
          }
          if (!valid_res.priceAccuracy) {
            console.log(
              `   Budget   -> Expected: ${element.expectedBudget} | Got: ${res.max_price}`,
            );
          }
        } else {
          console.log(`✅ Passed: "${element.userQuery}"`);
        }
      }
    } catch (error) {
      console.error("Error : [", error, " ]");
    }
  }
  console.log("\n--- EVALUATION SUMMARY ---");
  console.log(`Total Evaluated: ${LENGTH}`);
  console.log(
    `Category Accuracy: ${metrics.categoryAccuracy}/${LENGTH} (${((metrics.categoryAccuracy / LENGTH) * 100).toFixed(1)}%)`,
  );
  console.log(
    `Level Accuracy:    ${metrics.levelAccuracy}/${LENGTH} (${((metrics.levelAccuracy / LENGTH) * 100).toFixed(1)}%)`,
  );
  console.log(
    `Price Accuracy:    ${metrics.priceAccuracy}/${LENGTH} (${((metrics.priceAccuracy / LENGTH) * 100).toFixed(1)}%)`,
  );
  console.log(
    `Show All Accuracy:    ${metrics.show_all}/${evaleSuite.filter((d) => d.expectedShowAll).length} (${((metrics.show_all / evaleSuite.filter((d) => d.expectedShowAll).length) * 100).toFixed(1)}%)`,
  );
}

function validate(expected: TEvaleSuite, agent_res: AnalyzedQuery) {
  let matric: TMatrics = {
    categoryAccuracy: 0,
    levelAccuracy: 0,
    priceAccuracy: 0,
    show_all: 0,
  };
  if (agent_res.category == expected.expectedCategory)
    matric.categoryAccuracy = 1;
  if (agent_res.level == expected.expectedLevel) matric.levelAccuracy = 1;
  if (agent_res.max_price == expected.expectedBudget) matric.priceAccuracy = 1;
  if (agent_res.show_all) matric.show_all = 1;
  return matric;
}

// run_suite();
run();
