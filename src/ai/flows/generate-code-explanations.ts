'use server';

/**
 * @fileOverview Provides AI-generated explanations for code snippets, including complex code blocks,
 * bug occurrences, and vulnerability details.
 *
 * - generateCodeExplanations - A function that accepts code and returns AI-generated explanations.
 * - GenerateCodeExplanationsInput - The input type for the generateCodeExplanations function.
 * - GenerateCodeExplanationsOutput - The return type for the generateCodeExplanations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeExplanationsInputSchema = z.object({
  code: z.string().describe('The code snippet to be analyzed.'),
  language: z.string().describe('The programming language of the code snippet.'),
});
export type GenerateCodeExplanationsInput = z.infer<
  typeof GenerateCodeExplanationsInputSchema
>;

const GenerateCodeExplanationsOutputSchema = z.object({
  explanation: z.string().describe('The AI-generated explanation of the code.'),
  bugs: z.array(z.string()).describe('The list of potential bugs found in the code.'),
  vulnerabilities: z
    .array(z.string())
    .describe('The list of potential vulnerabilities found in the code.'),
});
export type GenerateCodeExplanationsOutput = z.infer<
  typeof GenerateCodeExplanationsOutputSchema
>;

export async function generateCodeExplanations(
  input: GenerateCodeExplanationsInput
): Promise<GenerateCodeExplanationsOutput> {
  return generateCodeExplanationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeExplanationsPrompt',
  input: {schema: GenerateCodeExplanationsInputSchema},
  output: {schema: GenerateCodeExplanationsOutputSchema},
  prompt: `You are a code analysis expert. Analyze the given code snippet and provide explanations for complex code blocks, potential bug occurrences, and vulnerability details.

  Language: {{{language}}}
  Code: {{{code}}}

  Explanation:
  Bugs:
  Vulnerabilities:`,
});

const generateCodeExplanationsFlow = ai.defineFlow(
  {
    name: 'generateCodeExplanationsFlow',
    inputSchema: GenerateCodeExplanationsInputSchema,
    outputSchema: GenerateCodeExplanationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
