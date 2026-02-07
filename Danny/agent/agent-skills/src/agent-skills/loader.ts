import fs from "fs";
import path from "path";
import yaml from "yaml";
import { z } from "zod";

export const SkillMetadataSchema = z.object({
  name: z.string(),
  description: z.string(),
  path: z.string(), // Absolute path to the skill directory
});

export type SkillMetadata = z.infer<typeof SkillMetadataSchema>;

export interface Skill {
  metadata: SkillMetadata;
  content: string; // The full content of SKILL.md
}

// Helper to extract frontmatter and content
function parseSkillFile(filePath: string): {
  frontmatter: any;
  content: string;
} {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const match = fileContent.match(/---\n([\s\S]*?)\n---\n([\s\S]*)/);

  if (match) {
    const frontmatterRaw = match[1] ?? "";
    const content = match[2] ?? "";
    try {
      const frontmatter = yaml.parse(frontmatterRaw);
      return { frontmatter, content: fileContent }; // Return full content or just body? Spec says "reads the full SKILL.md instructions into context", so arguably the whole file or just the body. Let's return the whole file as "content" but parse frontmatter for metadata.
      // Actually, usually we want the whole file content to be injected so the model sees the header too.
    } catch (e) {
      console.error(`Error parsing YAML in ${filePath}`, e);
      return { frontmatter: {}, content: fileContent };
    }
  }

  // Fallback if no frontmatter found (invalid skill but handle gracefully)
  return { frontmatter: {}, content: fileContent };
}

export class SkillLoader {
  private skillsDir: string;

  constructor(skillsDir: string) {
    this.skillsDir = skillsDir;
  }

  async loadSkills(): Promise<SkillMetadata[]> {
    const skills: SkillMetadata[] = [];

    if (!fs.existsSync(this.skillsDir)) {
      return [];
    }

    const entries = fs.readdirSync(this.skillsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = path.join(this.skillsDir, entry.name);
        const skillMdPath = path.join(skillPath, "SKILL.md");

        if (fs.existsSync(skillMdPath)) {
          const { frontmatter } = parseSkillFile(skillMdPath);

          const result = SkillMetadataSchema.safeParse({
            name: frontmatter.name || entry.name,
            description: frontmatter.description || "No description provided",
            path: skillPath,
          });

          if (result.success) {
            skills.push(result.data);
          } else {
            console.warn(
              `Invalid skill metadata in ${skillPath}:`,
              result.error,
            );
          }
        }
      }
    }

    return skills;
  }

  async getSkillContent(skillName: string): Promise<string | null> {
    // In a real implementation, we might map names to paths efficiently.
    // For now, scan or assume structure if we trust the loader.
    // Better: Registry should handle this. Loader just loads.
    // But let's add a simple lookup here for the demo.
    const skills = await this.loadSkills();
    const skill = skills.find((s) => s.name === skillName);
    if (skill) {
      return fs.readFileSync(path.join(skill.path, "SKILL.md"), "utf-8");
    }
    return null;
  }
}
