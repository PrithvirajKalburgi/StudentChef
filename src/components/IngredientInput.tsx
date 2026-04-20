import { useState, KeyboardEvent } from 'react';
import { Plus, X, Utensils, Search } from 'lucide-react';
import { FilterType, PantryItem } from '../App';
import { motion, AnimatePresence } from 'motion/react';

const COMMON_INGREDIENTS = [
  'Eggs', 'Rice', 'Milk', 'Pasta', 'Onion', 'Garlic', 
  'Potato', 'Chicken', 'Beans', 'Cheese', 'Tomato', 'Bread'
];

interface Props {
  initialPantry: PantryItem[];
  initialFilter: FilterType;
  onFindRecipes: (items: PantryItem[], filter: FilterType) => void;
}

export default function IngredientInput({ initialPantry, initialFilter, onFindRecipes }: Props) {
  const [pantry, setPantry] = useState<PantryItem[]>(initialPantry);
  const [inputValue, setInputValue] = useState('');
  const [qtyValue, setQtyValue] = useState('');
  const [filterType, setFilterType] = useState<FilterType>(initialFilter);

  const addIngredient = (name: string, qty: string = '') => {
    const cleanName = name.trim();
    if (!cleanName) return;
    
    // Capitalize first letter
    const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
    
    if (!pantry.some(p => p.name === formattedName)) {
      setPantry([{ name: formattedName, quantity: qty.trim() }, ...pantry]);
    }
    setInputValue('');
    setQtyValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient(inputValue, qtyValue);
    }
  };

  const removeIngredient = (name: string) => {
    setPantry(pantry.filter(i => i.name !== name));
  };

  const handleSearch = () => {
    if (pantry.length > 0) {
      onFindRecipes(pantry, filterType);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-2 py-4 text-slate-800 dark:text-slate-100 transition-colors">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          What's in your fridge?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Add the leftovers you have, and we'll generate delicious, budget-friendly student meals.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-200">
        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Add Ingredient & Quantity (Optional)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={qtyValue}
            onChange={(e) => setQtyValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Qty (e.g. 6 or 250g)"
            className="w-1/3 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100 transition-colors"
          />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ingredient (e.g. Eggs)"
            className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100 transition-colors"
          />
          <button
            onClick={() => addIngredient(inputValue, qtyValue)}
            disabled={!inputValue.trim()}
            className="bg-green-500 text-white w-12 h-[38px] rounded-lg flex items-center justify-center text-xl font-bold disabled:opacity-50 hover:bg-green-600 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Quick Add Tabs */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {COMMON_INGREDIENTS.map(item => {
              const isAdded = pantry.some(p => p.name === item);
              return (
                <button
                  key={item}
                  onClick={() => isAdded ? removeIngredient(item) : addIngredient(item, qtyValue)}
                  className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                    isAdded 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-green-500/50 dark:hover:border-green-500/50'
                  }`}
                >
                  {isAdded ? '✓ ' : '+ '}{item}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pantry List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Current Pantry ({pantry.length})</label>
          {pantry.length > 0 && (
            <button 
              onClick={() => setPantry([])}
              className="text-[10px] text-slate-400 hover:text-red-500 transition-colors uppercase font-bold"
            >
              Clear all
            </button>
          )}
        </div>

        {pantry.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 transition-colors">
            <Utensils className="mb-2 opacity-50" size={24} />
            <p className="text-xs">Your pantry is empty.<br/>Add ingredients to begin.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {pantry.map(item => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="pantry-tag"
                >
                  <span>{item.quantity ? <span className="text-green-600 dark:text-green-400 font-bold mr-1">{item.quantity}</span> : null}{item.name}</span>
                  <button 
                    onClick={() => removeIngredient(item.name)}
                    className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors px-1"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Action Area */}
      {pantry.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg md:relative md:bg-transparent md:border-0 md:shadow-none md:p-0 z-20 transition-colors"
        >
          <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl md:shadow-sm md:border border-slate-200 dark:border-slate-700 space-y-3 max-w-3xl mx-auto transition-colors">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
              <button
                onClick={() => setFilterType('flexible')}
                className={`flex-1 py-1.5 px-3 rounded flex items-center justify-center text-[11px] font-bold transition-colors ${
                  filterType === 'flexible' 
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Missing 1 - 2 ingredients
              </button>
              <button
                onClick={() => setFilterType('exact')}
                className={`flex-1 py-1.5 px-3 rounded flex items-center justify-center text-[11px] font-bold transition-colors ${
                  filterType === 'exact' 
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                100% Match
              </button>
            </div>
            <button
              onClick={handleSearch}
              className="w-full bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl py-3 font-semibold text-sm shadow-sm hover:bg-slate-700 dark:hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              Save & Find Recipes
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
