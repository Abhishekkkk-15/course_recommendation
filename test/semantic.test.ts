import { loadDataSet } from "../src/semantic";
import { describe, it, expect } from "vitest";
import path from "path";
describe("load DataSet from CSV", async () => {
  const csvPath = path.join(process.cwd(), "static", "Course_Dummy_Data.csv");
  const dataset = await loadDataSet(csvPath);
  it("should load data from CSV file", async () => {
    expect(Array.isArray(dataset)).toBe(true);
    expect(dataset.length).toBeGreaterThan(0);
  });

  it("should have correct keys in the dataset", async () => {
    const firstIndex = dataset[0];
    expect(firstIndex).toHaveProperty("course_name");
    expect(firstIndex).toHaveProperty("id");
    expect(firstIndex).toHaveProperty("description");
    expect(firstIndex).toHaveProperty("category");
    expect(firstIndex).toHaveProperty("price");
    expect(firstIndex).toHaveProperty("level");
    expect(firstIndex).toHaveProperty("status");
  });
});
