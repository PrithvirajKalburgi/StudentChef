import { useState, useEffect } from 'react';
import { FilterType, PantryItem } from '../App';
import { RecipeSuggestion, generateRecipeSuggestions } from '../lib/geminiService';
import { Clock, Loader2, Sparkles, AlertCircle, RefreshCw, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  pantry: PantryItem[];
  filterType: FilterType;
  onFilterChange: (type: FilterType) => void;
  onSelectRecipe: (recipe: RecipeSuggestion) => void;
  recipes: RecipeSuggestion[];
  setRecipes: (recipes: RecipeSuggestion[]) => void;
}

export default function RecipeList({ 
  pantry, 
  filterType, 
  onFilterChange, 
  onSelectRecipe, 
  recipes, 
  setRecipes 
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async (items: PantryItem[], filter: FilterType) => {
    setLoading(true);
    setError(null);
    try {
      const queryItems = items.map(i => i.quantity ? `${i.quantity} ${i.name}` : i.name);
      const results = await generateRecipeSuggestions(queryItems, filter);
      setRecipes(results);
    } catch (err: any) {
      console.error(err);
      if (err.message === 'QUOTA_EXCEEDED') {
        setError("Gemini API quota exceeded. Free tier quotas reset daily. Please try again tomorrow or use a different API key.");
      } else {
        setError("We couldn't generate recipes right now. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch when mounted if we have no recipes, or if filter explicitly changed here
  useEffect(() => {
    if (recipes.length === 0) {
      fetchRecipes(pantry, filterType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only fetch purely on mount if empty. If users want to re-fetch, they click a button.

  const handleToggleFilter = (newFilter: FilterType) => {
    if (newFilter !== filterType) {
      onFilterChange(newFilter);
      fetchRecipes(pantry, newFilter);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-4 transition-colors duration-200">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-slate-800 dark:text-slate-100">Suggested Meals</h2>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{recipes.length} Results</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleToggleFilter('exact')}
            disabled={loading}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${
              filterType === 'exact' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
            } disabled:opacity-50`}
          >
            100% Match
          </button>
          <button
            onClick={() => handleToggleFilter('flexible')}
            disabled={loading}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${
              filterType === 'flexible' ? 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
            } disabled:opacity-50`}
          >
            Missing 1 -2 ingredients
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center justify-center space-y-3 transition-colors duration-200">
          <Loader2 className="animate-spin text-green-500" size={32} />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">Brainstorming recipes...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-4 rounded-2xl border border-red-200 dark:border-red-900/30 text-center space-y-3 text-sm transition-colors duration-200">
          <AlertCircle className="mx-auto" size={24} />
          <p>{error}</p>
          <button 
            onClick={() => fetchRecipes(pantry, filterType)}
            className="bg-white dark:bg-slate-800 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/30 px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 mx-auto hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors font-bold"
          >
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && recipes.length === 0 && (
        <div className="py-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 transition-colors duration-200">
          <Utensils size={32} className="mb-3 opacity-50" />
          <p className="text-sm">No recipes found. Try adding more ingredients!</p>
        </div>
      )}

      {/* Recipe List */}
      {!loading && !error && recipes.length > 0 && (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {recipes.map((recipe, index) => {
              const isMissing = recipe.missingIngredients && recipe.missingIngredients.length > 0;
              return (
                <motion.div
                  key={recipe.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => onSelectRecipe(recipe)}
                  className={`recipe-card p-4 rounded-xl cursor-pointer ${isMissing ? 'bg-white opacity-90' : 'border-green-500 bg-green-50/20 dark:bg-green-900/10'} overflow-hidden relative`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">{recipe.title}</h3>
                    {isMissing ? (
                      <span className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-1.5 py-0.5 rounded font-bold shrink-0">
                        -{recipe.missingIngredients.length} ITEM{recipe.missingIngredients.length > 1 ? 'S' : ''}
                      </span>
                    ) : (
                      <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded font-bold shrink-0">READY</span>
                    )}
                  </div>
                  
                  {isMissing ? (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">
                      Missing: <span className="text-orange-600 dark:text-orange-400">{recipe.missingIngredients.join(', ')}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">
                       Great match for your pantry!
                    </p>
                  )}

                  <div className="flex gap-3 text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-3 border-t border-slate-100 dark:border-slate-700 pt-2 transition-colors">
                    <span className="flex items-center gap-1"><Clock size={12}/> {recipe.timeToCook}</span>
                    <span className="flex items-center gap-1"><Sparkles size={12}/> {recipe.nutritionSummary}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
