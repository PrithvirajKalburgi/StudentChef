import { useState, useEffect } from 'react';
import { RecipeSuggestion, RecipeDetails, generateRecipeDetails } from '../lib/geminiService';
import { ArrowLeft, Loader2, DollarSign, Flame, Wheat, Beef, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { PantryItem } from '../App';

interface Props {
  recipe: RecipeSuggestion;
  pantry: PantryItem[];
  onBack: () => void;
}

export default function RecipeDetail({ recipe, pantry, onBack }: Props) {
  const [details, setDetails] = useState<RecipeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryItems = pantry.map(p => typeof p === 'string' ? p : `${p.quantity} ${p.name}`);
        const result = await generateRecipeDetails(recipe, queryItems);
        if (isMounted) setDetails(result);
      } catch (err: any) {
        console.error(err);
        if (isMounted) {
          if (err.message === 'QUOTA_EXCEEDED') {
            setError("Gemini API quota exceeded. Free tier quotas reset daily. Please try again tomorrow.");
          } else {
            setError("Failed to load details. Please try again.");
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDetails();
    return () => { isMounted = false; };
  }, [recipe, pantry]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header / Back Action */}
      <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-200">
        <button 
          onClick={onBack}
          className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <ArrowLeft size={16} className="text-slate-600 dark:text-slate-300" />
        </button>
        <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100">Back</span>
      </div>

      {/* Title Area */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-200">
        <div className="h-40 bg-slate-200 dark:bg-slate-700 relative transition-colors duration-200">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-5">
            <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
              {recipe.title}
            </h2>
            <div className="flex gap-3">
              <span className="text-xs text-white/90 font-medium tracking-wide">
                ⏱️ {recipe.timeToCook}
              </span>
              <span className="text-xs text-white/90 font-medium tracking-wide">
                ✨ {recipe.nutritionSummary}
              </span>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="py-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center justify-center space-y-3 transition-colors duration-200">
          <Loader2 className="animate-spin text-green-500" size={32} />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">Writing instructions...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-4 rounded-2xl border border-red-200 dark:border-red-900/30 text-sm font-medium text-center transition-colors duration-200">
          <p>{error}</p>
        </div>
      )}

      {!loading && details && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-6 transition-colors duration-200"
        >
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 nutrition-pill text-blue-700 dark:text-blue-400 transition-colors">
              <span className="opacity-70 mb-1">Carbs</span>
              <span className="text-base text-blue-800 dark:text-blue-300">{details.nutritionBreakdown.carbs}</span>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 nutrition-pill text-green-700 dark:text-green-400 transition-colors">
              <span className="opacity-70 mb-1">Protein</span>
              <span className="text-base text-green-800 dark:text-green-300">{details.nutritionBreakdown.protein}</span>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 nutrition-pill text-orange-700 dark:text-orange-400 transition-colors">
              <span className="opacity-70 mb-1">Fats</span>
              <span className="text-base text-orange-800 dark:text-orange-300">{details.nutritionBreakdown.fats}</span>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 nutrition-pill text-slate-700 dark:text-slate-300 transition-colors">
              <span className="opacity-70 mb-1">Cost</span>
              <span className="text-base text-slate-900 dark:text-slate-100">{details.costEstimate}</span>
            </div>
          </div>

          {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
            <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 p-4 rounded-xl flex items-start gap-3 transition-colors">
              <AlertTriangle className="text-orange-500 dark:text-orange-400 shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-0.5">Missing Ingredients</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  You'll need: <span className="font-semibold text-orange-600 dark:text-orange-400">{recipe.missingIngredients.join(', ')}</span>
                </p>
              </div>
            </div>
          )}

          {/* Steps */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-4">Instructions</h4>
            <div className="space-y-4">
              {details.steps.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <span className="w-6 h-6 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold transition-colors">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug pt-0.5 transition-colors">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30 flex items-center justify-between transition-colors">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-green-600 dark:text-green-500 uppercase">Chef's Tip</span>
              <span className="text-xs text-green-800 dark:text-green-400 font-medium italic">Cook with joy and stay within budget!</span>
            </div>
            <button className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-green-700 dark:hover:bg-green-600 transition-colors">
              Cook Mode
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
