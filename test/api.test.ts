import { describe, it, expect } from "vitest";

describe("API Query Validation", async () => {
  it("should reject query request without 'q' parameter with 400", async () => {
    const res = await fetch("http://localhost:3333/api/query");
    expect(res.status).toBe(400);
    const data: { error: string } = await res.json();
    expect(data.error).toBe("Query parameter 'q' is required.");
  });

  it("should return course list from /api/courses", async () => {
    const res = await fetch("http://localhost:3333/api/courses");
    expect(res.status).toBe(200);
    const data: [] = await res.json();
    expect(data.length).toBeGreaterThan(0);
  });
});
