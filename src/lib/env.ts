import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
});

export const env = (() => {
  const parsed = envSchema.safeParse({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  });

  if (!parsed.success) {
    const issueMessages = parsed.error.issues.map((issue) => issue.message);
    throw new Error(issueMessages.join("\n"));
  }

  return parsed.data;
})();
