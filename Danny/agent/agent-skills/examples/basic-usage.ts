import { createOpenAI } from "@ai-sdk/openai";
import { generateText, tool, type ModelMessage } from "ai";
import { SkillLoader } from "../src/agent-skills/loader.js";
import {
  createSkillTools,
  formatSystemPrompt,
} from "../src/agent-skills/vercel-ai.js";
import path from "path";
import * as dotenv from "dotenv";
import * as readline from "readline";

dotenv.config();

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const skillsDir = path.join(__dirname, "skills");
  const loader = new SkillLoader(skillsDir);
  const skillTools = createSkillTools(loader);
  const systemPrompt = await formatSystemPrompt(loader);

  console.log("--- System Prompt Injection ---");
  console.log(systemPrompt);
  console.log("-------------------------------");

  // Ensure environment variables are present
  const baseURL = process.env.OPENAI_BASE_URL;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!baseURL || !apiKey) {
    throw new Error("Missing OPENAI_BASE_URL or OPENAI_API_KEY in .env");
  }

  // 配置 OpenAI 提供商以使用自定义 Base URL 和 API Key
  const openai = createOpenAI({
    baseURL,
    apiKey,
  });

  const model = openai.chat("gemini-3-flash");

  console.log("\n--- Simulation Start ---");
  if (process.env.DEBUG === "true") {
    console.log("Debug mode enabled");
  }

  const messages: ModelMessage[] = [];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("Enter your message (type 'exit' to quit):");

  const askQuestion = () => {
    rl.question("\nUser: ", async (input) => {
      if (input.toLowerCase() === "exit") {
        rl.close();
        return;
      }

      messages.push({ role: "user", content: input });

      try {
        const result = await generateText({
          model: model,
          // maxSteps: 5, // AI SDK v6 removed maxSteps from generateText, use stopWhen
          stopWhen: ({ steps }: { steps: unknown[] }) => steps.length >= 10,
          tools: {
            ...skillTools,
          },
          system: systemPrompt,
          messages: messages,
        });

        console.log(`\nAI: ${result.text}`);

        if (process.env.DEBUG === "true") {
          console.log("\n--- [DEBUG] Steps ---");
          console.dir(result.steps, { depth: 2 });
        }

        // Add the new messages (assistant response and potential tool calls/results) to history
        // result.response.messages contains the *newly generated* messages for this turn
        messages.push(...result.response.messages);
      } catch (error) {
        console.error("Error during generation:", error);
      }

      askQuestion();
    });
  };

  askQuestion();
}

main().catch(console.error);
