import express from "express";
import { loadDataSet, Store, type DataRow } from "./semantic.js";
import { LLM } from "./llm.js";
import path from "path";
import fs from "fs";

const csvPath = path.join(process.cwd(), "static", "Course_Dummy_Data.csv");
const assetsPath = path.join(process.cwd(), "assets");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(assetsPath));

async function main() {
  try {
    const dataset = await loadDataSet(csvPath);
    const llm = new LLM();
    const store = new Store(llm.embeddings);
    await store.addData(dataset);

    app.get("/api/courses", (_req, res) => {
      res.json(dataset);
    });

    const handleQuery = async (req: express.Request, res: express.Response) => {
      const query = (req.query.q as string)?.trim();
      if (!query) {
        return res
          .status(400)
          .json({ error: "Query parameter 'q' is required." });
      }

      try {
        const analyzedQuery = await llm.analyzeAgent(query);
        console.log("Analyzed Query:", analyzedQuery);

        let rawResults: any[] = [];
        if (analyzedQuery.show_all) {
          rawResults = dataset;
        } else {
          rawResults = await store.queryData(
            analyzedQuery.semantic_query,
            analyzedQuery.level,
            analyzedQuery.category,
            analyzedQuery.max_price,
          );
        }

        const formattedResults = rawResults.map((r: any) => {
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
          query,
          JSON.stringify(formattedResults),
        );

        if (req.query.format === "text") {
          return res.send(recommendation);
        }

        return res.json({
          query,
          analysis: analyzedQuery,
          courses: formattedResults,
          recommendation,
        });
      } catch (err: any) {
        console.error("Error processing query:", err);
        return res.status(500).json({
          error: "Failed to process course recommendation query.",
          details: err?.message || String(err),
        });
      }
    };

    app.get("/api/query", handleQuery);

    const PORT = process.env.PORT || 3333;
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main().catch((error) => {
  console.error("Error in main function:", error);
});
