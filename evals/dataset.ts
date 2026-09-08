import type { TCategory, Level } from "../src/semantic.js";

export type TEvaleSuite = {
  userQuery: string;
  expectedCategory: TCategory;
  expectedLevel: Level;
  expectedBudget: number | null;
  expectedId: number | null;
  expectedShowAll: boolean;
};

export const evaleSuite: TEvaleSuite[] = [
  // 1. Explicit Category + Level + Budget
  {
    userQuery: "Python programming for complete beginners under 5000",
    expectedCategory: "Technology",
    expectedLevel: "Beginner",
    expectedBudget: 5000,
    expectedId: 111,
    expectedShowAll: false,
  },
  // 2. Implicit Level via "Foundation"
  {
    userQuery: "I want to prepare for CA Foundation exams",
    expectedCategory: "CA",
    expectedLevel: "Beginner",
    expectedBudget: null,
    expectedId: 101,
    expectedShowAll: false,
  },
  // 3. Explicit Level + Tech Skills
  {
    userQuery: "Intermediate Excel and Power BI for dashboarding",
    expectedCategory: "Technology",
    expectedLevel: "Intermediate",
    expectedBudget: null,
    expectedId: 113,
    expectedShowAll: false,
  },
  // 4. Budget with "k" notation + Unspecified Level (defaults to All)
  {
    userQuery: "financial modelling course below 6k",
    expectedCategory: "Finance",
    expectedLevel: "All",
    expectedBudget: 6000,
    expectedId: 108,
    expectedShowAll: false,
  },
  // 5. Certification Category + No Budget
  {
    userQuery: "practical course on GST returns and compliance",
    expectedCategory: "Certification",
    expectedLevel: "All",
    expectedBudget: null,
    expectedId: 107,
    expectedShowAll: false,
  },
  // 6. Conversational filler query on AI
  {
    userQuery: "Hey, can you please recommend me something on generative AI?",
    expectedCategory: "Technology",
    expectedLevel: "All",
    expectedBudget: null,
    expectedId: 112,
    expectedShowAll: false,
  },
  // 7. CS Domain + Implicit Level ("Executive" = Intermediate)
  {
    userQuery: "CS Executive complete preparation course",
    expectedCategory: "CS",
    expectedLevel: "Intermediate",
    expectedBudget: null,
    expectedId: 104,
    expectedShowAll: false,
  },
  // 8. CMA Domain + Foundation
  {
    userQuery: "CMA Foundation accounting and economics course",
    expectedCategory: "CMA",
    expectedLevel: "Beginner",
    expectedBudget: null,
    expectedId: 105,
    expectedShowAll: false,
  },
  // 9. Finance with low budget constraint
  {
    userQuery: "Excel course focused on financial analysis under 3000",
    expectedCategory: "Finance",
    expectedLevel: "All",
    expectedBudget: 3000,
    expectedId: 110,
    expectedShowAll: false,
  },
  // 10. Intro to Investment Banking for starters
  {
    userQuery: "Investment banking fundamentals for beginners",
    expectedCategory: "Finance",
    expectedLevel: "Beginner",
    expectedBudget: null,
    expectedId: 109,
    expectedShowAll: false,
  },
  // 11. Business Analytics with price limit
  {
    userQuery: "Business analytics with SQL and excel under 7000",
    expectedCategory: "Technology",
    expectedLevel: "All",
    expectedBudget: 7000,
    expectedId: 114,
    expectedShowAll: false,
  },
  // 12. CA Intermediate Group 1
  {
    userQuery: "CA Intermediate group 1 advanced accounting and law",
    expectedCategory: "CA",
    expectedLevel: "Intermediate",
    expectedBudget: null,
    expectedId: 102,
    expectedShowAll: false,
  },
  // 13. CA Intermediate Group 2
  {
    userQuery: "CA Intermediate group 2 auditing and financial management",
    expectedCategory: "CA",
    expectedLevel: "Intermediate",
    expectedBudget: null,
    expectedId: 103,
    expectedShowAll: false,
  },
  // 14. CMA Intermediate
  {
    userQuery: "CMA Intermediate costing and taxation preparation",
    expectedCategory: "CMA",
    expectedLevel: "Intermediate",
    expectedBudget: null,
    expectedId: 106,
    expectedShowAll: false,
  },
  // 15. Show All browse query
  {
    userQuery: "show me all courses available in your catalog",
    expectedCategory: "All",
    expectedLevel: "All",
    expectedBudget: null,
    expectedId: null,
    expectedShowAll: true,
  },
  // 16. Out-of-catalog / Unsatisfiable budget edge case
  {
    userQuery: "Python course under 1000 rupees",
    expectedCategory: "Technology",
    expectedLevel: "All",
    expectedBudget: 1000,
    expectedId: null,
    expectedShowAll: false,
  },
];

export const limitDataSet = (
  dataset: TEvaleSuite[],
  limit: number,
): TEvaleSuite[] => {
  return dataset.slice(0, limit);
};
