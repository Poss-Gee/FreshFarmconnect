
'use server';
/**
 * @fileOverview An AI flow for checking symptoms and recommending a specialist.
 *
 * - suggestSpecialist - A function that handles the symptom analysis.
 * - SymptomCheckerInput - The input type for the suggestSpecialist function.
 * - SymptomCheckerOutput - The return type for the suggestSpecialist function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { DOCTOR_SPECIALTIES } from '@/lib/specialties';

const SymptomCheckerInputSchema = z.object({
  symptoms: z.string().min(10).describe('A description of the patient\'s symptoms.'),
});
export type SymptomCheckerInput = z.infer<typeof SymptomCheckerInputSchema>;

const SymptomCheckerOutputSchema = z.object({
  specialist: z.string().describe('The recommended specialist from the provided list.'),
  reasoning: z.string().describe('A brief explanation for why this specialist is recommended.'),
});
export type SymptomCheckerOutput = z.infer<typeof SymptomCheckerOutputSchema>;

export async function suggestSpecialist(input: SymptomCheckerInput): Promise<SymptomCheckerOutput> {
  return symptomCheckerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'symptomCheckerPrompt',
  input: { schema: SymptomCheckerInputSchema },
  output: { schema: SymptomCheckerOutputSchema },
  prompt: `You are a helpful medical assistant. Your role is to analyze a patient's symptoms and recommend the most appropriate specialist from a given list.

Analyze the following symptoms:
"{{{symptoms}}}"

Based on these symptoms, choose the most relevant specialist from the following list:
${DOCTOR_SPECIALTIES.join(', ')}

Provide a brief, one-sentence reasoning for your recommendation. Your tone should be helpful and reassuring, but you must include a clear disclaimer that you are an AI assistant and not a medical professional, and the user should consult a real doctor.
`,
});

const symptomCheckerFlow = ai.defineFlow(
  {
    name: 'symptomCheckerFlow',
    inputSchema: SymptomCheckerInputSchema,
    outputSchema: SymptomCheckerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
