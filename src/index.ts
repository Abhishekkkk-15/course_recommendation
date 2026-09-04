import express from "express";
import { OpenAIClient } from "@langchain/openai";
const app = express();
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
