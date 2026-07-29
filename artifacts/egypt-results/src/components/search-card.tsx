'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Hash, User, Clock, ChevronLeft, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchByName } from '@/lib/api';
import type { Student, StudentSearchResult } from '@/types';

const RECENT_KEY = 'egypt_recent_seats';
const MAX_RECENT = 5;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function SearchCard() {
  const router = useRouter();
  const [tab, setTab] = useState<'seat' | 'name'>('seat');

  // Seat search
  const [seatInput, setSeatInput] = useState('');
  const [seatError, setSeatError] = useState('');
  const [isSearchingSeat, setIsSearchingSeat] = useState(false);
  const [recentSeats, setRecentSeats] = useState<number[]>([]);

  // Name search
  const [nameInput, setNameInput] = useState('');
  const [nameResults, setNameResults] = useState<StudentSearchResult | null>(null);
  const [isSearchingName, setIsSearchingName] = useState(false);
  const [nameError, setNameError] = useState('');
  const [page, setPage] = useState(1);
  const debouncedName = useDebounce(nameInput.trim(), 500);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) setRecentSeats(JSON.parse(saved));
    } catch {}
  }, []);

  const saveRecent = (seat: number) => {
    const updated = [seat, ...recentSeats.filter(s => s !== seat)].slice(0, MAX_RECENT);
    setRecentSeats(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const handleSeatSearch = async (seatNum?: number) => {
    const val = seatNum ?? Number(seatInput);
    if (!val || isNaN(val) || val <= 0) {
      setSeatError('الرجاء إدخال رقم جلوس صحيح');
      return;
    }
    setSeatError('');
    setIsSearchingSeat(true);
    try {
      const res = await fetch(`/api/results/${val}`);
      if (res.ok) {
        saveRecent(val);
        router.push(`/result/${val}`);
      } else {
        setSeatError('عذراً، لم يتم العثور على نتيجة لهذا الرقم');
      }
    } catch {
      setSeatError('حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSearchingSeat(false);
    }
  };

  const doNameSearch = useCallback(async (name: string, pg: number) => {
    if (!name || name.length < 2) return;
    setIsSearchingName(true);
    setNameError('');
    try {
      const result = await searchByName(name, pg, 10);
      setNameResults(result);
    } catch {
      setNameError('حدث خطأ في البحث');
    } finally {
      setIsSearchingName(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedName.length >= 2) {
      setPage(1);
      doNameSearch(debouncedName, 1);
    } else {
      setNameResults(null);
    }
  }, [debouncedName, doNameSearch]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    doNameSearch(debouncedName, newPage);
  };

  const handleStudentClick = (student: Student) => {
    saveRecent(student.seatNumber);
    router.push(`/result/${student.seatNumber}`);
  };

  return (
    <section id="search-section" className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl glass glass-border shadow-2xl shadow-black/10 overflow-hidden"
      >
        {/* Tab Header */}
        <div className="p-6 pb-0">
          <div className="flex rounded-2xl bg-muted p-1 gap-1">
            <button
              onClick={() => setTab('seat')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200',
                tab === 'seat'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Hash className="w-4 h-4" />
              رقم الجلوس
            </button>
            <button
              onClick={() => setTab('name')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200',
                tab === 'name'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <User className="w-4 h-4" />
              البحث بالاسم
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {tab === 'seat' ? (
              <motion.div
                key="seat"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <form
                  onSubmit={e => { e.preventDefault(); handleSeatSearch(); }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="أدخل رقم الجلوس..."
                      value={seatInput}
                      onChange={e => { setSeatInput(e.target.value); setSeatError(''); }}
                      dir="ltr"
                      className={cn(
                        'w-full h-16 text-xl text-center px-6 rounded-2xl border-2 bg-background transition-all duration-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10',
                        seatError ? 'border-destructive focus:border-destructive focus:ring-destructive/10' : 'border-input'
                      )}
                    />
                  </div>

                  <AnimatePresence>
                    {seatError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-2 text-destructive text-sm font-medium"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {seatError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={isSearchingSeat}
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shine"
                  >
                    {isSearchingSeat
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري البحث...</>
                      : 'عرض النتيجة'}
                  </motion.button>
                </form>

                {/* Recent Searches */}
                <AnimatePresence>
                  {recentSeats.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="pt-4 space-y-3 border-t border-border"
                    >
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        عمليات بحث سابقة
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recentSeats.map(seat => (
                          <motion.button
                            key={seat}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSeatSearch(seat)}
                            className="px-4 py-1.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-full text-sm font-semibold transition-colors"
                            dir="ltr"
                          >
                            {seat}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="أدخل الاسم أو جزء منه..."
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="w-full h-16 text-xl pr-14 pl-6 rounded-2xl border-2 border-input bg-background transition-all duration-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isSearchingName
                      ? <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      : <Search className="w-6 h-6 text-muted-foreground" />}
                  </div>
                </div>

                {nameInput.length > 0 && nameInput.length < 2 && (
                  <p className="text-xs text-muted-foreground">أدخل حرفين على الأقل للبحث</p>
                )}

                {/* Results */}
                <AnimatePresence>
                  {nameError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 text-destructive text-sm">
                      {nameError}
                    </motion.div>
                  )}

                  {!isSearchingName && nameResults && nameResults.students.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 text-muted-foreground text-sm">
                      لم يتم العثور على نتائج مطابقة
                    </motion.div>
                  )}

                  {nameResults && nameResults.students.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <p className="text-xs text-muted-foreground font-medium">
                        تم العثور على {nameResults.total.toLocaleString('ar-EG')} نتيجة
                      </p>
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {nameResults.students.map((student, i) => (
                          <motion.button
                            key={student.seatNumber}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => handleStudentClick(student)}
                            className="w-full group p-4 bg-background border border-border rounded-xl hover:border-primary/40 hover:shadow-md transition-all text-right flex items-center justify-between"
                          >
                            <div>
                              <h3 className="font-bold text-base group-hover:text-primary transition-colors">
                                {student.arabicName}
                              </h3>
                              <p className="text-muted-foreground text-sm mt-0.5 flex flex-wrap gap-3">
                                <span>رقم الجلوس: <span className="font-semibold text-foreground" dir="ltr">{student.seatNumber}</span></span>
                                <span>المجموع: <span className="font-semibold text-foreground" dir="ltr">{student.totalDegree}</span></span>
                              </p>
                            </div>
                            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                          </motion.button>
                        ))}
                      </div>

                      {nameResults.total > nameResults.limit && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <button
                            disabled={page === 1}
                            onClick={() => handlePageChange(page - 1)}
                            className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            السابق
                          </button>
                          <span className="text-sm text-muted-foreground px-2">صفحة {page}</span>
                          <button
                            disabled={page * nameResults.limit >= nameResults.total}
                            onClick={() => handlePageChange(page + 1)}
                            className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            التالي
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
