import React, { useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  PiggyBank, 
  Target, 
  Save, 
  Edit2,
  Check,
  ChevronRight,
  LogOut,
  Calendar,
  AlertCircle,
  Moon,
  Sun,
  X,
  Coins,
  Gem,
  Globe,
  Briefcase,
  Layers,
  LineChart,
  LifeBuoy,
  Plane,
  Plus,
  Trash2,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { 
  auth, 
  db, 
  signIn, 
  signOut, 
  handleFirestoreError, 
  OperationType 
} from './lib/firebase';
import LandingPage from './components/LandingPage';
import { 
  FinancialProfile, 
  CATEGORY_LABELS, 
  CategoryKey,
  IncomeRecord,
  AllocationItem
} from './types';
import { 
  calculateRequiredSavings, 
  formatCurrency, 
  calculateRemainingTime 
} from './lib/calculations';

const DEFAULT_PROFILE: Omit<FinancialProfile, 'userId' | 'updatedAt'> = {
  goalDate: '2026-12-31',
  categories: {
    salary: { goal: 0, current: 0 },
    etf: { goal: 0, current: 0 },
    stocks: { goal: 0, current: 0 },
    mutual_funds: { goal: 0, current: 0 },
    emergency_funds: { goal: 0, current: 0 },
    travel_fund: { goal: 0, current: 0 },
    gold_silver: { goal: 0, current: 0 },
    international_stocks: { goal: 0, current: 0 }
  }
};

  const getCategoryIcon = (key: CategoryKey) => {
    switch (key) {
      case 'salary': return <Briefcase className="w-4 h-4" />;
      case 'etf': return <Layers className="w-4 h-4" />;
      case 'stocks': return <LineChart className="w-4 h-4" />;
      case 'mutual_funds': return <TrendingUp className="w-4 h-4" />;
      case 'emergency_funds': return <LifeBuoy className="w-4 h-4" />;
      case 'travel_fund': return <Plane className="w-4 h-4" />;
      case 'gold_silver': return <Gem className="w-4 h-4" />;
      case 'international_stocks': return <Globe className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const CategoryDetailView = ({ 
    categoryKey, 
    onBack, 
    profile, 
    allocationForm, 
    setAllocationForm, 
    isEditingAllocations, 
    setIsEditingAllocations, 
    handleUpdateAllocations,
    handleUpdateProfile,
    isEditingGoals,
    setIsEditingGoals,
    editForm,
    setEditForm
  }: { 
    categoryKey: CategoryKey, 
    onBack: () => void,
    profile: FinancialProfile | null,
    allocationForm: AllocationItem[],
    setAllocationForm: React.Dispatch<React.SetStateAction<AllocationItem[]>>,
    isEditingAllocations: boolean,
    setIsEditingAllocations: React.Dispatch<React.SetStateAction<boolean>>,
    handleUpdateAllocations: () => Promise<void>,
    handleUpdateProfile: (e: React.FormEvent) => Promise<void>,
    isEditingGoals: boolean,
    setIsEditingGoals: React.Dispatch<React.SetStateAction<boolean>>,
    editForm: FinancialProfile | null,
    setEditForm: React.Dispatch<React.SetStateAction<FinancialProfile | null>>
  }) => {
    if (!profile) return null;
    const data = profile.categories[categoryKey];
    const savings = calculateRequiredSavings(data.goal, data.current, profile.goalDate);
    const remainingTime = calculateRemainingTime(profile.goalDate);
    const totalAllocated = allocationForm.reduce((acc, curr) => acc + (parseFloat(String(curr.amount)) || 0), 0);
    const projectedGoal = (parseFloat(String(data.current)) || 0) + (totalAllocated * remainingTime.months);
    const isOverTarget = projectedGoal >= (parseFloat(String(data.goal)) || 0);

    const isSalary = categoryKey === 'salary';
    const activeEditCategory = editForm?.categories[categoryKey];
    
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors font-bold text-xs uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
               {getCategoryIcon(categoryKey)}
             </div>
             <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">{CATEGORY_LABELS[categoryKey]} Allocation</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-5">
            {/* Goal Configuration Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Goal Metrics</p>
                {!isEditingGoals ? (
                  <button 
                    onClick={() => {
                      setEditForm(profile);
                      setIsEditingGoals(true);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-indigo-500 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditingGoals(false)}
                      className="text-[9px] font-bold text-zinc-400 uppercase hover:text-zinc-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={(e) => {
                        handleUpdateProfile(e as any);
                        setIsEditingGoals(false);
                      }}
                      className="text-[9px] font-bold text-emerald-600 uppercase hover:text-emerald-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-6 space-y-6">
                {!isEditingGoals ? (
                  <>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Target End Goal</p>
                      <h3 className="text-2xl font-black font-mono text-zinc-900 dark:text-white">
                        {formatCurrency(data.goal)}
                      </h3>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Current Portfolio</p>
                      <h3 className="text-2xl font-black font-mono text-zinc-900 dark:text-white">
                        {formatCurrency(data.current)}
                      </h3>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Time horizon</p>
                      <div className="flex items-center gap-2 text-zinc-900 dark:text-white">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-bold">{new Date(profile.goalDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Daily Target Milestone</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-sm">₹</span>
                        <input 
                          type="number"
                          value={activeEditCategory?.goal}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditForm(prev => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                categories: {
                                  ...prev.categories,
                                  [categoryKey]: { ...prev.categories[categoryKey], goal: val }
                                }
                              };
                            });
                          }}
                          className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-sm text-emerald-600 outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Current Portfolio State</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-sm">₹</span>
                        <input 
                          type="number"
                          value={activeEditCategory?.current}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditForm(prev => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                categories: {
                                  ...prev.categories,
                                  [categoryKey]: { ...prev.categories[categoryKey], current: val }
                                }
                              };
                            });
                          }}
                          className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-sm text-indigo-600 outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Universe End Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                        <input 
                          type="date"
                          value={editForm?.goalDate}
                          onChange={(e) => setEditForm(prev => prev ? ({ ...prev, goalDate: e.target.value }) : null)}
                          className="w-full pl-10 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 relative z-10">Monthly Required Savings</p>
              <h3 className="text-3xl font-black font-mono text-emerald-600 relative z-10">
                {formatCurrency(savings.monthly)}
              </h3>
              <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 relative z-10">
                <div className="flex justify-between text-xs font-bold text-zinc-500 mb-2 uppercase tracking-tighter">
                  <span>Actual Allocation</span>
                  <span>{formatCurrency(totalAllocated)}</span>
                </div>
                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500"
                    style={{ width: `${Math.min(100, (totalAllocated / (parseFloat(String(savings.monthly)) || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {!isSalary ? (
              <div className={`p-6 rounded-2xl border shadow-xl relative overflow-hidden transition-all ${isOverTarget ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 relative z-10 ${isOverTarget ? 'text-emerald-100' : 'text-zinc-400'}`}>Projected 2026 Outcome</p>
                <h3 className={`text-4xl font-black font-mono relative z-10 ${isOverTarget ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`}>
                  {formatCurrency(projectedGoal)}
                </h3>
                <p className={`text-[9px] font-bold uppercase mt-4 relative z-10 ${isOverTarget ? 'text-emerald-100' : 'text-zinc-500'}`}>
                  Growth based on current momentum
                </p>
                
                {isOverTarget ? (
                  <div className="mt-4 flex items-center gap-2 bg-white/10 p-3 rounded-xl backdrop-blur-sm relative z-10">
                    <Check className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase">Velocity is optimal</span>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900/30 relative z-10">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-500">
                      Portfolio Gap detected
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Income Profile</p>
                <h3 className="text-3xl font-black font-mono text-indigo-600">
                  Recurring
                </h3>
                <p className="text-[9px] font-bold text-zinc-500 uppercase mt-4">
                  Salary is treated as cash flow, not an investment goal.
                </p>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Planned Allocations</h3>
                {!isEditingAllocations ? (
                  <button 
                    onClick={() => setIsEditingAllocations(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-800 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all"
                  >
                    <Edit2 className="w-3 h-3" />
                    Manage
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setIsEditingAllocations(false);
                        setAllocationForm(data.allocations || []);
                      }}
                      className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpdateAllocations}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all"
                    >
                      <Save className="w-3 h-3" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-6 space-y-4">
                {allocationForm.length === 0 && !isEditingAllocations && (
                  <div className="text-center py-10">
                    <Layers className="w-10 h-10 text-zinc-200 mx-auto mb-4" />
                    <p className="text-zinc-400 font-medium text-sm">No allocations set for this category.</p>
                  </div>
                )}

                {allocationForm.map((item, idx) => (
                  <div key={item.id} className="flex gap-4 items-end animate-in fade-in slide-in-from-left-2 transition-all">
                    <div className="flex-1 space-y-1.5">
                      {idx === 0 && <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Asset Name</label>}
                      <input 
                        disabled={!isEditingAllocations}
                        value={item.name}
                        onChange={(e) => {
                          const newForm = [...allocationForm];
                          newForm[idx].name = e.target.value;
                          setAllocationForm(newForm);
                        }}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-sm text-zinc-900 dark:text-zinc-100 disabled:opacity-70 focus:border-indigo-500 outline-none transition-all"
                        placeholder="e.g. CPSE ETF"
                      />
                    </div>
                    <div className="w-32 sm:w-48 space-y-1.5 text-right">
                      {idx === 0 && <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mr-1">Monthly Amount</label>}
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-sm leading-none">₹</span>
                        <input 
                          disabled={!isEditingAllocations}
                          type="number"
                          value={item.amount}
                          onChange={(e) => {
                            const newForm = [...allocationForm];
                            newForm[idx].amount = e.target.value;
                            setAllocationForm(newForm);
                          }}
                          className="w-full pl-7 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 disabled:opacity-70 focus:border-indigo-500 outline-none transition-all text-right"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    {isEditingAllocations && (
                      <button 
                        onClick={() => {
                          setAllocationForm(allocationForm.filter(i => i.id !== item.id));
                        }}
                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                {isEditingAllocations && (
                  <button 
                    onClick={() => {
                      setAllocationForm([...allocationForm, { id: crypto.randomUUID(), name: '', amount: '' }]);
                    }}
                    className="w-full py-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 hover:text-indigo-500 hover:border-indigo-500/50 transition-all flex items-center justify-center gap-2 group"
                  >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Add New Asset Allocation</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [editForm, setEditForm] = useState<any | null>(null);
  const [showTooltipKey, setShowTooltipKey] = useState<CategoryKey | null>(null);
  const [activeCategoryKey, setActiveCategoryKey] = useState<CategoryKey | null>(null);
  const [isEditingAllocations, setIsEditingAllocations] = useState(false);
  const [allocationForm, setAllocationForm] = useState<AllocationItem[]>([]);
  
  // Monthly Income Tracker State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [isSavingIncome, setIsSavingIncome] = useState(false);
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [hasIncomeRecord, setHasIncomeRecord] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    console.log('Theme toggle triggered. Current dark mode state:', isDarkMode);
    if (isDarkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const docRef = doc(db, 'profiles', user.uid);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as FinancialProfile;
        // Merge with DEFAULT_PROFILE to ensure new categories are present
        const mergedCategories = { ...DEFAULT_PROFILE.categories, ...data.categories };
        setProfile({ ...data, categories: mergedCategories });
      } else {
        initializeProfile(user.uid);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `profiles/${user.uid}`);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user || !selectedMonth || !selectedYear) return;

    const recordId = `${user.uid}_${selectedYear}_${selectedMonth}`;
    const docRef = doc(db, 'income_records', recordId);
    
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as IncomeRecord;
        setMonthlyIncome(String(data.amount));
        setHasIncomeRecord(true);
        setIsEditingIncome(false);
      } else {
        setMonthlyIncome('');
        setHasIncomeRecord(false);
        setIsEditingIncome(true);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `income_records/${recordId}`);
    });

    return unsubscribe;
  }, [user, selectedMonth, selectedYear]);

  const handleSaveIncome = async () => {
    if (!user || !selectedMonth || !selectedYear) return;
    
    setIsSavingIncome(true);
    const recordId = `${user.uid}_${selectedYear}_${selectedMonth}`;
    
    try {
      await setDoc(doc(db, 'income_records', recordId), {
        userId: user.uid,
        amount: parseFloat(monthlyIncome) || 0,
        month: selectedMonth,
        year: selectedYear,
        updatedAt: serverTimestamp()
      });
      setIsEditingIncome(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `income_records/${recordId}`);
    } finally {
      setIsSavingIncome(false);
    }
  };

  const initializeProfile = async (uid: string) => {
    try {
      await setDoc(doc(db, 'profiles', uid), {
        ...DEFAULT_PROFILE,
        userId: uid,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `profiles/${uid}`);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editForm) return;

    try {
      const formattedCategories = { ...editForm.categories };
      Object.keys(formattedCategories).forEach((key) => {
        const k = key as CategoryKey;
        formattedCategories[k] = {
          goal: parseFloat(String(formattedCategories[k].goal)) || 0,
          current: parseFloat(String(formattedCategories[k].current)) || 0,
          allocations: formattedCategories[k].allocations || []
        };
      });

      await setDoc(doc(db, 'profiles', user.uid), {
        ...editForm,
        categories: formattedCategories,
        userId: user.uid,
        updatedAt: serverTimestamp()
      });
      setIsEditingGoals(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `profiles/${user.uid}`);
    }
  };

  const handleUpdateAllocations = async () => {
    if (!user || !profile || !activeCategoryKey) return;

    try {
      const updatedCategories = { ...profile.categories };
      updatedCategories[activeCategoryKey] = {
        ...updatedCategories[activeCategoryKey],
        allocations: allocationForm.map(item => ({
          ...item,
          amount: parseFloat(String(item.amount)) || 0
        }))
      };

      await setDoc(doc(db, 'profiles', user.uid), {
        ...profile,
        categories: updatedCategories,
        updatedAt: serverTimestamp()
      });
      setIsEditingAllocations(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `profiles/${user.uid}`);
    }
  };

  const handleToggleMonthlyMilestone = async (categoryKey: CategoryKey) => {
    if (!user || !profile) return;

    const dateKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    const currentMilestones = { ...(profile.monthlyMilestones || {}) };
    const monthMilestones = currentMilestones[dateKey] || [];

    let updatedMonthMilestones: CategoryKey[];
    if (monthMilestones.includes(categoryKey)) {
      updatedMonthMilestones = monthMilestones.filter(k => k !== categoryKey);
    } else {
      updatedMonthMilestones = [...monthMilestones, categoryKey];
    }

    currentMilestones[dateKey] = updatedMonthMilestones;

    try {
      await setDoc(doc(db, 'profiles', user.uid), {
        ...profile,
        monthlyMilestones: currentMilestones,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `profiles/${user.uid}`);
    }
  };

  const isCategoryCompletedThisMonth = (categoryKey: CategoryKey) => {
    if (!profile?.monthlyMilestones) return false;
    const dateKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    return profile.monthlyMilestones[dateKey]?.includes(categoryKey) || false;
  };

  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <LandingPage onSignIn={signIn} />;
  }

  const remaining = profile ? calculateRemainingTime(profile.goalDate) : { months: 0, weeks: 0, days: 0 };
  const totalMonthly = profile ? Object.keys(profile.categories).reduce((acc, key) => {
    const cat = profile.categories[key as CategoryKey];
    return acc + calculateRequiredSavings(cat.goal, cat.current, profile.goalDate).monthly;
  }, 0) : 0;

  const totalCurrent = profile ? Object.keys(profile.categories).reduce((acc, key) => acc + (parseFloat(String(profile.categories[key as CategoryKey].current)) || 0), 0) : 0;
  const totalGoal = profile ? Object.keys(profile.categories).reduce((acc, key) => acc + (parseFloat(String(profile.categories[key as CategoryKey].goal)) || 0), 0) : 0;
  const overallProgress = totalGoal > 0 ? (totalCurrent / totalGoal) * 100 : 0;

  // Global Projection Logic (excluding Salary)
  const monthsRemaining = profile ? calculateRemainingTime(profile.goalDate).months : 0;
  const totalProjected = profile ? Object.keys(profile.categories).reduce((acc, key) => {
    if (key === 'salary') return acc;
    const data = profile.categories[key as CategoryKey];
    const categoryCurrent = parseFloat(String(data.current)) || 0;
    const categoryMonthlyAllocated = (data.allocations || []).reduce((sum, item) => sum + (parseFloat(String(item.amount)) || 0), 0);
    return acc + (categoryCurrent + (categoryMonthlyAllocated * monthsRemaining));
  }, 0) : 0;
  const isGlobalOnTrack = totalProjected >= totalGoal;

  // Generate dynamic chart data based on progress and time
  const currentMonthIdx = new Date().getMonth();
  const velocityData = Array.from({ length: 7 }, (_, i) => {
    const offset = i - 3; // Center on current month
    if (offset < 0) {
      // Historical simulation: show how we got here
      return Math.max(5, overallProgress * (1 + offset * 0.15));
    }
    if (offset === 0) {
      // Current actual progress
      return Math.max(8, overallProgress);
    }
    // Projection: how we need to grow to hit 100%
    const remainingSteps = 12 - (currentMonthIdx + 1);
    const growthNeeded = (100 - overallProgress) / Math.max(1, remainingSteps);
    return Math.min(100, overallProgress + (offset * growthNeeded));
  });

  return (
    <div 
      className={`${isDarkMode ? 'dark' : ''} min-h-screen bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-50 overflow-x-hidden font-sans transition-colors duration-300`}
      onClick={() => setShowTooltipKey(null)}
    >
      {/* Navigation Bar */}
      <nav className="h-16 px-4 sm:px-8 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-800 dark:text-white">Track your Wealth <span className="text-emerald-600">Goal</span></h1>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Active Profile</p>
            <p className="text-sm font-semibold dark:text-zinc-200">{user.displayName}</p>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-all"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button 
            onClick={signOut}
            className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {!activeCategoryKey ? (
            <motion.div 
              key="main-grid"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 auto-rows-max"
            >
              {/* Left Section: Configuration & Timeline */}
              <section className="md:col-span-4 space-y-5">
                {/* Timeline Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6"
                >
                  <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-1 h-3 bg-emerald-500 rounded-full"></span>
                    Time Horizon
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        {profile?.goalDate ? new Date(profile.goalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </p>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase mt-1">Target Date</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
                        <p className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100 leading-none">{remaining.months}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Months</p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-700/50">
                        <p className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100 leading-none">{Math.floor(remaining.weeks)}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Weeks</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Progress Chart Simulation */}
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.1 }}
                   className="bg-zinc-900 dark:bg-zinc-900 rounded-2xl p-6 text-white overflow-hidden relative border border-transparent dark:border-zinc-800 shadow-xl"
                >
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Total Progress</p>
                        <h4 className="text-3xl font-black font-mono italic text-white">{overallProgress.toFixed(1)}%</h4>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center text-[10px] font-bold text-white">
                        {Math.round(overallProgress)}%
                      </div>
                    </div>
                    <div className="grow flex items-end gap-1.5 h-32">
                      {velocityData.map((h, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 rounded-t-sm transition-all duration-1000 ${i === 3 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : i < 3 ? 'bg-zinc-800 dark:bg-zinc-700' : 'bg-zinc-800/40 dark:bg-zinc-700/40'}`} 
                          style={{ height: `${h}%` }}
                        >
                          {i === 3 && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full blur-[2px]"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 px-1">
                      <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-tighter">History</p>
                      <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-tighter">Current</p>
                      <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-tighter">Projected</p>
                    </div>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-900/40 blur-3xl"></div>
                </motion.div>

                {/* Monthly Income Tracker */}
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 }}
                   className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm"
                >
                  <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-1 h-3 bg-indigo-500 rounded-full"></span>
                    Monthly Earnings Tracker
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 ring-indigo-500/20 dark:text-zinc-100"
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                      <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="w-24 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 ring-indigo-500/20 dark:text-zinc-100"
                      >
                        {[2024, 2025, 2026, 2027].map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    <AnimatePresence mode="wait">
                      {hasIncomeRecord && !isEditingIncome ? (
                        <motion.div 
                          key="view"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex flex-col items-center justify-center py-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 group/card relative"
                        >
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mb-1">Total Earned</p>
                          <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                            {formatCurrency(parseFloat(monthlyIncome) || 0)}
                          </h3>
                          
                          {parseFloat(monthlyIncome) > 0 && (
                            <div className="mt-4 w-full px-6 flex flex-col items-center">
                              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mb-2">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, (parseFloat(monthlyIncome) / totalMonthly) * 100)}%` }}
                                  className={`h-full ${parseFloat(monthlyIncome) >= totalMonthly ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                />
                              </div>
                              <div className="flex justify-between w-full text-[9px] font-black uppercase tracking-tighter">
                                <span className={`${parseFloat(monthlyIncome) >= totalMonthly ? 'text-emerald-500' : 'text-indigo-500'}`}>
                                  {Math.round((parseFloat(monthlyIncome) / totalMonthly) * 100)}% of goal
                                </span>
                                {parseFloat(monthlyIncome) < totalMonthly && (
                                  <span className="text-zinc-500">
                                    {formatCurrency(totalMonthly - parseFloat(monthlyIncome))} left
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); setIsEditingIncome(true); }}
                            className="absolute top-2 right-2 p-2 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-full transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="edit"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-4"
                        >
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-sm leading-none">₹</span>
                            <input 
                              type="number"
                              placeholder="Enter monthly income"
                              value={monthlyIncome}
                              onChange={(e) => setMonthlyIncome(e.target.value)}
                              className="w-full pl-8 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500 transition-colors"
                            />
                          </div>

                          <div className="flex gap-2">
                             {hasIncomeRecord && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); setIsEditingIncome(false); }}
                                className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-xl font-bold text-[10px] tracking-widest uppercase hover:bg-zinc-200 transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleSaveIncome(); }}
                              disabled={isSavingIncome}
                              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                            >
                              {isSavingIncome ? (
                                <motion.div 
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                                />
                              ) : hasIncomeRecord ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                              {isSavingIncome ? 'Saving...' : hasIncomeRecord ? 'Update Record' : 'Save Record'}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Monthly Goals Checklist */}
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 }}
                   className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm"
                >
                  <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-1 h-3 bg-emerald-500 rounded-full"></span>
                    Monthly Milestone Registry
                  </h2>
                  
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear} Deployment
                  </p>

                  <div className="space-y-2">
                    {profile && (Object.keys(profile.categories) as CategoryKey[]).filter(k => k !== 'salary').map((key) => {
                      const completed = isCategoryCompletedThisMonth(key);
                      return (
                        <div 
                          key={`checklist-${key}`}
                          onClick={() => handleToggleMonthlyMilestone(key)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            completed 
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' 
                              : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                              completed ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600'
                            }`}>
                              {completed && <Check className="w-3 h-3" />}
                            </div>
                            <span className="text-xs font-black uppercase tracking-tight">{CATEGORY_LABELS[key]}</span>
                          </div>
                          {completed && <span className="text-[8px] font-bold uppercase py-0.5 px-1.5 bg-emerald-100 dark:bg-emerald-800/50 rounded">Manifested</span>}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-tighter">
                      Mark your monthly goals as they are achieved. The respective asset cards will maintain a visual confirmation state.
                    </p>
                  </div>
                </motion.div>
              </section>

              {/* Right Section: Main Metrics & Details */}
              <section className="md:col-span-8 space-y-5">
                {/* Metrics Overview Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Primary Velocity Metric */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-600 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden group"
                  >
                    <div className="relative z-10">
                      <p className="text-emerald-100/70 text-[10px] font-bold uppercase tracking-widest mb-2">Required Monthly Velocity</p>
                      <h3 className="text-3xl md:text-5xl font-black font-mono tracking-tighter mb-6 flex items-baseline">
                        {formatCurrency(totalMonthly).split('.')[0]}
                        <span className="text-lg md:text-xl opacity-40">.{formatCurrency(totalMonthly).split('.')[1] || '00'}</span>
                      </h3>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold border border-white/5">
                          {formatCurrency(totalMonthly / 4).split('.')[0]} / weekly target
                        </span>
                        <span className="px-3 py-1 bg-emerald-500/30 rounded-full text-[10px] font-bold">
                          Active Velocity
                        </span>
                      </div>
                    </div>
                    {/* Visual Flair */}
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl group-hover:bg-emerald-400/30 transition-all duration-700"></div>
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <TrendingUp className="w-24 h-24" />
                    </div>
                  </motion.div>

                  {/* Total Networth Goal Card */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`rounded-3xl shadow-xl p-8 text-white relative overflow-hidden group transition-all duration-500 ${isGlobalOnTrack ? 'bg-indigo-600' : 'bg-zinc-900 border border-zinc-800'}`}
                  >
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                           <p className="text-indigo-100/70 text-[10px] font-bold uppercase tracking-widest">Portfolio Target 2026</p>
                           {isGlobalOnTrack ? (
                             <span className="bg-emerald-500/20 text-emerald-300 text-[8px] font-black uppercase px-2 py-1 rounded-md border border-emerald-500/20">On Track</span>
                           ) : (
                             <span className="bg-amber-500/20 text-amber-300 text-[8px] font-black uppercase px-2 py-1 rounded-md border border-amber-500/20">Gap in Strategy</span>
                           )}
                        </div>
                        <h3 className="text-3xl md:text-5xl font-black font-mono tracking-tighter">
                          {formatCurrency(totalGoal).split('.')[0]}
                          <span className="text-lg md:text-xl opacity-40">.{formatCurrency(totalGoal).split('.')[1] || '00'}</span>
                        </h3>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-white/10">
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isGlobalOnTrack ? 'text-indigo-200' : 'text-zinc-500'}`}>Projected Portfolio Value</p>
                        <div className="flex items-baseline gap-2">
                          <h4 className={`text-2xl font-black font-mono ${isGlobalOnTrack ? 'text-emerald-400' : 'text-indigo-400'}`}>
                            {formatCurrency(totalProjected).split('.')[0]}
                          </h4>
                          <span className={`text-[10px] font-bold uppercase ${isGlobalOnTrack ? 'text-emerald-500/60' : 'text-zinc-500'}`}>Realization</span>
                        </div>
                        
                        {!isGlobalOnTrack && (
                          <p className="text-[9px] font-bold text-amber-400 uppercase mt-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Deficit: {formatCurrency(totalGoal - totalProjected)}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Visual Flair */}
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl group-hover:bg-indigo-400/30 transition-all duration-700"></div>
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Gem className="w-24 h-24" />
                    </div>
                  </motion.div>
                </div>

                {/* Categories Grid (Sub-Bento) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {profile && (Object.keys(profile.categories) as CategoryKey[]).map((key, idx) => {
                    const data = profile.categories[key];
                    const savings = calculateRequiredSavings(data.goal, data.current, profile.goalDate);
                    const progress = Math.min(100, (parseFloat(String(data.current)) / parseFloat(String(data.goal) || "1")) * 100);
                    
                    // Projection Logic
                    const remainingTime = calculateRemainingTime(profile.goalDate);
                    const totalAllocated = (data.allocations || []).reduce((acc, curr) => acc + (parseFloat(String(curr.amount)) || 0), 0);
                    const projectedGoal = (parseFloat(String(data.current)) || 0) + (totalAllocated * remainingTime.months);
                    const isOverTarget = projectedGoal >= (parseFloat(String(data.goal)) || 0);

                    return (
                      <motion.div 
                        key={key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 + 0.2 }}
                        onClick={() => {
                          setActiveCategoryKey(key);
                          setAllocationForm(data.allocations || []);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`p-5 rounded-2xl border transition-all group shadow-sm hover:shadow-md cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                          isCategoryCompletedThisMonth(key)
                            ? 'bg-emerald-600 border-emerald-500 text-white dark:text-white'
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/30 dark:hover:border-emerald-500/50'
                        }`}
                      >
                         {/* Category Icon */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className={`text-xs font-bold uppercase tracking-tight ${isCategoryCompletedThisMonth(key) ? 'text-emerald-100' : 'text-zinc-500 dark:text-zinc-400'}`}>{CATEGORY_LABELS[key]}</h4>
                            <p className={`text-xl font-bold font-mono mt-1 transition-colors ${
                              isCategoryCompletedThisMonth(key) ? 'text-white' : 'group-hover:text-emerald-700 dark:group-hover:text-emerald-400 dark:text-zinc-100'
                            }`}>
                              {formatCurrency(savings.monthly)}
                            </p>
                            <p className={`text-[10px] font-medium ${isCategoryCompletedThisMonth(key) ? 'text-emerald-100/70' : 'text-zinc-400 dark:text-zinc-500'}`}>Monthly Target</p>
                          </div>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            isCategoryCompletedThisMonth(key) 
                              ? 'bg-emerald-500/50 text-white' 
                              : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                          }`}>
                            {getCategoryIcon(key)}
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div 
                          className="relative group/progress mb-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTooltipKey(showTooltipKey === key ? null : key);
                          }}
                        >
                          <div className={`w-full h-2 rounded-full overflow-hidden ${isCategoryCompletedThisMonth(key) ? 'bg-black/10' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              className={`h-full ${isCategoryCompletedThisMonth(key) ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'bg-emerald-500'}`}
                            />
                          </div>
                          
                          {/* Tooltip on Hover & Click */}
                          <div className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-zinc-800 text-white text-[10px] py-1.5 px-3 rounded-lg pointer-events-none whitespace-nowrap transition-all duration-200 transform shadow-xl z-20 font-mono font-black border border-emerald-500/30 flex items-center gap-2 ${
                            showTooltipKey === key 
                              ? 'opacity-100 translate-y-0' 
                              : 'opacity-0 translate-y-2 group-hover/progress:opacity-100 group-hover/progress:translate-y-0'
                          }`}>
                             <span className="text-emerald-400">{formatCurrency(data.current)}</span>
                             <span className="text-zinc-500">/</span>
                             <span className="text-zinc-200">{formatCurrency(data.goal)}</span>
                             <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 dark:bg-zinc-800 rotate-45 border-b border-r border-emerald-500/30"></div>
                          </div>
                        </div>

                        <div className={`flex justify-between items-center text-[10px] font-bold mb-4 ${isCategoryCompletedThisMonth(key) ? 'text-emerald-50/80' : 'text-zinc-400'}`}>
                          <span>{Math.round(progress)}% Complete</span>
                          <span className={isCategoryCompletedThisMonth(key) ? 'text-emerald-50/60' : 'text-zinc-600 dark:text-zinc-500'}>Goal: {formatCurrency(data.goal)}</span>
                        </div>

                        {/* Projection Summary Section (Excluding Salary) */}
                        {key !== 'salary' && (
                          <div className={`pt-4 border-t mt-auto ${isCategoryCompletedThisMonth(key) ? 'border-white/10' : 'border-zinc-100 dark:border-zinc-800/50'}`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-[9px] font-black uppercase tracking-widest ${isCategoryCompletedThisMonth(key) ? 'text-emerald-100/50' : 'text-zinc-400'}`}>Projected End</span>
                              <span className={`text-[11px] font-black font-mono ${
                                isCategoryCompletedThisMonth(key) ? 'text-white' : isOverTarget ? 'text-emerald-500' : 'text-indigo-500 dark:text-indigo-400'
                              }`}>
                                {formatCurrency(projectedGoal)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className={`text-[8px] font-bold uppercase ${isCategoryCompletedThisMonth(key) ? 'text-emerald-100/50' : 'text-zinc-400'}`}>Status</span>
                              <div className="flex items-center gap-1">
                                {isCategoryCompletedThisMonth(key) || isOverTarget ? (
                                  <Check className={`w-2.5 h-2.5 ${isCategoryCompletedThisMonth(key) ? 'text-white' : 'text-emerald-500'}`} />
                                ) : (
                                  <AlertCircle className="w-2.5 h-2.5 text-amber-500" />
                                )}
                                <span className={`text-[9px] font-black uppercase ${
                                  isCategoryCompletedThisMonth(key) ? 'text-white' : isOverTarget ? 'text-emerald-500' : 'text-amber-500'
                                }`}>
                                  {isCategoryCompletedThisMonth(key) ? 'Goal Achieved' : isOverTarget ? 'On Track' : `Deficit: ${formatCurrency((parseFloat(String(data.goal)) || 0) - projectedGoal)}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Decoration */}
                        <ChevronRight className={`absolute -right-2 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors pointer-events-none ${
                          isCategoryCompletedThisMonth(key) ? 'text-white/10' : 'text-zinc-100 dark:text-zinc-800 group-hover:text-emerald-500/20'
                        }`} />
                        
                        {/* Background Glow for completed state */}
                        {isCategoryCompletedThisMonth(key) && (
                          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            </motion.div>
          ) : (
            <CategoryDetailView 
              categoryKey={activeCategoryKey}
              onBack={() => setActiveCategoryKey(null)}
              profile={profile}
              allocationForm={allocationForm}
              setAllocationForm={setAllocationForm}
              isEditingAllocations={isEditingAllocations}
              setIsEditingAllocations={setIsEditingAllocations}
              handleUpdateAllocations={handleUpdateAllocations}
              handleUpdateProfile={handleUpdateProfile}
              isEditingGoals={isEditingGoals}
              setIsEditingGoals={setIsEditingGoals}
              editForm={editForm}
              setEditForm={setEditForm}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
            Made with love by Sandip <motion.span 
              animate={{ scale: [1, 1.2, 1] }} 
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block"
            >❤️</motion.span>
          </p>
          <div className="flex items-center gap-3 text-zinc-200 dark:text-zinc-800">
             <div className="w-16 h-[1px] bg-current opacity-20"></div>
             <div className="w-1 h-1 rounded-full bg-current opacity-40"></div>
             <div className="w-16 h-[1px] bg-current opacity-20"></div>
          </div>
        </div>
      </footer>


    </div>
  );
}
