import { z } from "zod";
import { tool } from "ai";
import { SkillLoader } from "./loader.js";

export function createSkillTools(loader: SkillLoader) {
  return {
    open_skill: tool({
      description:
        "Activates a skill by loading its full instructions. Use this when a user task matches a skill description.",
      inputSchema: z.object({
        skillName: z.string().describe("The name of the skill to activate"),
      }),
      execute: async ({ skillName }) => {
        const content = await loader.getSkillContent(skillName);
        if (!content) {
          return `Skill "${skillName}" not found.`;
        }
        return `[SYSTEM: Skill "${skillName}" activated. Follow the instructions below.]\n\n${content}`;
      },
    }),
  };
}

export async function formatSystemPrompt(loader: SkillLoader) {
  const skills = await loader.loadSkills();
  if (skills.length === 0) {
    return "";
  }

  const skillList = skills
    .map(
      (s) =>
        `<skill>\n<name>${s.name}</name>\n<description>${s.description}</description>\n</skill>`,
    )
    .join("\n");

  return `
<available_skills>
${skillList}
</available_skills>

To use a skill, call the 'open_skill' tool with the skill name. 
Do not assume you know the skill instructions until you call 'open_skill'.
`;
}
