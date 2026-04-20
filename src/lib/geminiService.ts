import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface RecipeSuggestion {
  id: string;
  title: string;
  missingIngredients: string[];
  nutritionSummary: string;
  timeToCook: string;
}

export interface RecipeDetails {
  steps: string[];
  nutritionBreakdown: {
    protein: string;
    carbs: string;
    fats: string;
    calories: string;
  };
  costEstimate: string;
}

export async function generateRecipeSuggestions(
  ingredients: string[],
  filterType: 'exact' | 'flexible'
): Promise<RecipeSuggestion[]> {
  if (!ingredients.length) return [];

  const prompt = `I am a student on a budget. I have the following ingredients: ${ingredients.join(', ')}.
I want to cook a delicious meal.
${filterType === 'exact' ? 'Only suggest recipes I can make 100% with these ingredients (no missing ingredients allowed, except basic water/salt).' : 'Suggest recipes where I might be missing 1 or 2 ingredients.'}

Provide up to 5 recipe ideas.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: 'A unique short ID for the recipe' },
              title: { type: Type.STRING, description: 'The name of the dish' },
              missingIngredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Any ingredients required that are not in the provided list. Empty array if none.'
              },
              nutritionSummary: { type: Type.STRING, description: 'A short phrase like "High Protein" or "Balanced"' },
              timeToCook: { type: Type.STRING, description: 'Estimated time, e.g., "15 mins"' }
            },
            required: ['id', 'title', 'missingIngredients', 'nutritionSummary', 'timeToCook']
          }
        }
      }
    });

    const rawText = response.text || '[]';
    return JSON.parse(rawText) as RecipeSuggestion[];
  } catch (e: any) {
    if (e?.message?.toLowerCase().includes('quota') || e?.message?.includes('429')) {
      throw new Error('QUOTA_EXCEEDED');
    }
    console.error('Failed to generate recipes', e);
    throw new Error('GENERATE_FAILED');
  }
}

export async function generateRecipeDetails(
  recipe: RecipeSuggestion,
  availableIngredients: string[]
): Promise<RecipeDetails> {
  const prompt = `Give me the step-by-step instructions, detailed nutrition breakdown, and a student budget cost estimate for making "${recipe.title}".
I currently have: ${availableIngredients.join(', ')}.
I am missing: ${recipe.missingIngredients.join(', ')}.

Make the steps clear and easy to follow for a beginner cook. Ensure cost estimate reflects just the money needed (or overall cost).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Step by step cooking instructions'
            },
            nutritionBreakdown: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.STRING, description: 'e.g., 25g' },
                carbs: { type: Type.STRING, description: 'e.g., 40g' },
                fats: { type: Type.STRING, description: 'e.g., 12g' },
                calories: { type: Type.STRING, description: 'e.g., 450 kcal' }
              },
              required: ['protein', 'carbs', 'fats', 'calories']
            },
            costEstimate: { type: Type.STRING, description: 'Estimated total cost or cost of missing ingredients, e.g., "$3.50"' }
          },
          required: ['steps', 'nutritionBreakdown', 'costEstimate']
        }
      }
    });

    const rawText = response.text || '{}';
    return JSON.parse(rawText) as RecipeDetails;
  } catch (e: any) {
    if (e?.message?.toLowerCase().includes('quota') || e?.message?.includes('429')) {
      throw new Error('QUOTA_EXCEEDED');
    }
    console.error('Failed to parse recipe details', e);
    throw new Error('DETAILS_FAILED');
  }
}
