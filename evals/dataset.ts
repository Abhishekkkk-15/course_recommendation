import { TCategory, Level } from "../src/semantic";

type TEvaleSuite = {
  userQuery: string;
  expectedCategory: TCategory;
  expectedLevel: Level;
  expectedBudget: number | null;
  expectedId: number | null;
  expectedShowAll: boolean;
};

const evaleSuite: TEvaleSuite[] = [
  {
    userQuery: "Python programming for complete beginners under 5000",
    expectedCategory: "Technology",
    expectedLevel: "Beginner",
    expectedBudget: 5000,
    expectedId: 111,
    expectedShowAll: false,
  },
  {
    userQuery: "I want to prepare for CA Foundation exams",
    expectedCategory: "CA",
    expectedLevel: "Beginner",
    expectedBudget: null,
    expectedId: 101,
    expectedShowAll: false,
  },
  {
    userQuery: "Intermediate Excel and Power BI for dashboarding",
    expectedCategory: "Technology",
    expectedLevel: "Intermediate",
    expectedBudget: null,
    expectedId: 113,
    expectedShowAll: false,
  },
  {
    userQuery: "financial modelling course below 6k",
    expectedCategory: "Finance",
    expectedLevel: "Intermediate",
    expectedBudget: 6000,
    expectedId: 108,
    expectedShowAll: false,
  },
  {
    userQuery: "practical course on GST returns and compliance",
    expectedCategory: "Certification",
    expectedLevel: "All",
    expectedBudget: null,
    expectedId: 107,
    expectedShowAll: false,
  },
  {
    userQuery: "Hey, can you please recommend me something on generative AI?",
    expectedCategory: "Technology",
    expectedLevel: "All",
    expectedBudget: null,
    expectedId: 112,
    expectedShowAll: false,
  },
  {
    userQuery: "List all the courses u have in catalog",
    expectedCategory: "All",
    expectedLevel: "All",
    expectedBudget: null,
    expectedId: null,
    expectedShowAll: true,
  },
];
