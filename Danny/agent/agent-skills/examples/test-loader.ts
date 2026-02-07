import { SkillLoader } from "../src/agent-skills/loader.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const skillsDir = path.join(__dirname, "skills");
  const loader = new SkillLoader(skillsDir);

  console.log("Loading skills from:", skillsDir);
  const skills = await loader.loadSkills();
  console.log("Found skills:", skills);

  if (skills.length > 0) {
    const firstSkill = skills[0];
    console.log(`\nFetching content for skill: ${firstSkill.name}`);
    const content = await loader.getSkillContent(firstSkill.name);
    console.log("Content preview:", content?.substring(0, 100) + "...");
  } else {
    console.log(
      'No skills found. Make sure "examples/skills" exists and has subdirectories with SKILL.md',
    );
  }
}

main().catch(console.error);
