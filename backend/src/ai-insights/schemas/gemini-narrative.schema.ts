import { z } from 'zod';

export const GeminiNarrativeResponseSchema = z
  .object({
    summary: z.string().trim().min(1).max(1200),
    keyFindings: z.array(z.string().trim().min(1).max(400)).min(1).max(5),
    recommendations: z.array(z.string().trim().min(1).max(400)).max(5),
  })
  .strict();

export type GeminiNarrativeResponse = z.infer<
  typeof GeminiNarrativeResponseSchema
>;

const responseJsonSchema = z.toJSONSchema(GeminiNarrativeResponseSchema, {
  target: 'draft-7',
}) as Record<string, unknown>;
delete responseJsonSchema.$schema;

export const GeminiNarrativeResponseJsonSchema = responseJsonSchema;
