import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { GraduationCap, Sun, Moon } from 'lucide-react';
import IngredientInput from './components/IngredientInput';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import { RecipeSuggestion } from './lib/geminiService';

export type Screen = 'input' | 'list' | 'detail';
export type FilterType = 'exact' | 'flexible';

export interface PantryItem {
  name: string;
  quantity: string;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('input');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // App State
  const [pantry, setPantry] = useState<PantryItem[]>(() => {
    try {
      const saved = localStorage.getItem('pantry_items_v2');
      if (saved) return JSON.parse(saved);
      // Migrate v1
      const oldSaved = localStorage.getItem('pantry_items');
      if (oldSaved) {
        const parsed = JSON.parse(oldSaved);
        if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
          return parsed.map((p: string) => ({ name: p, quantity: '' }));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const darkPref = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkPref);
    if (darkPref) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    if (newVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(newVal));
  };

  const [filterType, setFilterType] = useState<FilterType>('flexible');
  const [recipes, setRecipes] = useState<RecipeSuggestion[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeSuggestion | null>(null);

  // Sync pantry to local storage
  useEffect(() => {
    localStorage.setItem('pantry_items_v2', JSON.stringify(pantry));
  }, [pantry]);

  const handleFindRecipes = (items: PantryItem[], filter: FilterType) => {
    setPantry(items);
    setFilterType(filter);
    setRecipes([]); // Clear existing recipes to trigger new fetch
    setScreen('list');
  };

  const handleSelectRecipe = (recipe: RecipeSuggestion) => {
    setSelectedRecipe(recipe);
    setScreen('detail');
  };

  const handleBackToList = () => {
    setScreen('list');
  };

  const handleBackToInput = () => {
    setScreen('input');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans selection:bg-green-500 selection:text-white pb-20 md:pb-0 transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm transition-colors duration-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setScreen('input')}
          >
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold transform group-hover:rotate-12 transition-transform">
              <GraduationCap size={18} />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">StudentChef</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {screen !== 'input' && (
              <button 
                onClick={handleBackToInput}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                My Pantry ({pantry.length})
              </button>
            )}
            <button 
              onClick={toggleDarkMode}
              className="p-2 -mr-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          {screen === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <IngredientInput 
                initialPantry={pantry} 
                initialFilter={filterType}
                onFindRecipes={handleFindRecipes} 
              />
            </motion.div>
          )}

          {screen === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <RecipeList 
                pantry={pantry} 
                filterType={filterType}
                onSelectRecipe={handleSelectRecipe}
                onFilterChange={setFilterType}
                recipes={recipes}
                setRecipes={setRecipes}
              />
            </motion.div>
          )}

          {screen === 'detail' && selectedRecipe && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RecipeDetail 
                recipe={selectedRecipe}
                pantry={pantry}
                onBack={handleBackToList}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
