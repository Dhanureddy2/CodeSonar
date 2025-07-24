'use server';

import { z } from 'zod';
import { codeReviewSuggestions } from '@/ai/flows/code-review-suggestions';
import { generateCodeExplanations } from '@/ai/flows/generate-code-explanations';

const analysisSchema = z.object({
  code: z.string().min(10, 'Code must be at least 10 characters long.'),
  language: z.enum(['javascript', 'python', 'java']),
});

export interface AnalysisState {
  suggestions?: string[];
  bugs?: string[];
  vulnerabilities?:string[];
  explanation?: string;
  error?: string | undefined;
  inputError?: string;
}

export async function analyzeCodeAction(
  formData: FormData
): Promise<AnalysisState> {
  const rawFormData = {
    code: formData.get('code'),
    language: formData.get('language'),
  };

  const validatedFields = analysisSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      inputError: validatedFields.error.flatten().fieldErrors.code?.[0] || validatedFields.error.flatten().fieldErrors.language?.[0] || 'Invalid input.',
    };
  }
  
  const { code, language } = validatedFields.data;

  try {
    const [suggestionsResult, explanationsResult] = await Promise.all([
      codeReviewSuggestions({ code, language }),
      generateCodeExplanations({ code, language }),
    ]);

    return {
      suggestions: suggestionsResult.suggestions,
      bugs: explanationsResult.bugs,
      vulnerabilities: explanationsResult.vulnerabilities,
      explanation: explanationsResult.explanation,
    };
  } catch (error) {
    console.error('AI analysis failed:', error);
    return {
      error: 'An error occurred during AI analysis. Please try again.',
    };
  }
}
