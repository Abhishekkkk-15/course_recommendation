import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import csv from "csv-parser";
import fs from "fs";
export const Categories = [
  "CA",
  "CS",
  "CMA",
  "Certification",
  "Finance",
  "Technology",
  "All",
] as const;

export type Level = "All" | "Beginner" | "Intermediate" | "Advanced";

export type TCategory = (typeof Categories)[number];

export type DataRow = {
  id: string;
  course_name: string;
  category: TCategory;
  description: string;
  price: number;
  level: Level;
  status: "Active" | "Inactive";
};

export function loadDataSet(path: string): Promise<DataRow[]> {
  const data: DataRow[] = [];
  return new Promise<DataRow[]>((resolve, reject) => {
    fs.createReadStream(path)
      .pipe(csv())
      .on("data", (row) => {
        data.push(row);
      })
      .on("end", () => {
        resolve(data);
      })
      .on("error", (error) => {
        console.error("Error reading CSV file:", error);
        reject(error);
      });
  });
}
export class Store {
  private store: MemoryVectorStore;
  constructor(embeddings: OpenAIEmbeddings) {
    this.store = new MemoryVectorStore(embeddings);
  }

  async addData(data: DataRow[]) {
    for (const row of data) {
      await this.store.addDocuments([
        {
          pageContent: `${row.course_name}. ${row.description}`,
          metadata: {
            id: row.id,
            course_name: row.course_name,
            category: row.category,
            price: Number(row.price) || 0,
            level: row.level,
            status: row.status,
          },
        },
      ]);
    }
  }

  async queryData(
    semantic_query: string,
    level: Level | null,
    category: TCategory | null,
    max_price: number | null,
  ) {
    const retriever = this.store.asRetriever({
      k: 6,
      filter: (doc) => {
        doc.metadata.status = "Active";
        if (level && level !== "All" && doc.metadata.level !== level) {
          return false;
        }

        if (
          category &&
          category !== "All" &&
          doc.metadata.category !== category
        ) {
          return false;
        }

        if (
          max_price !== null &&
          typeof doc.metadata.price === "number" &&
          doc.metadata.price > max_price
        ) {
          return false;
        }

        return true;
      },
    });

    const results = await retriever.invoke(semantic_query);

    return results.map((result) => ({
      content: result.pageContent,
      metadata: result.metadata,
    }));
  }
}
