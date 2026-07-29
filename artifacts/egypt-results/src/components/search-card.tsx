'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Loader2, Hash, User, Clock,
  ChevronLeft, AlertCircle, ArrowLeft,
} from 'lucide-react';
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
    <section id="search-section" className="w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl bg-card border border-border shadow-lg shadow-black/6 overflow-hidden"
      >
        {/* ── Tab strip ── */}
        <div className="flex border-b border-border">
          {([
            { key: 'seat', icon: Hash, label: 'رقم الجلوس' },
            { key: 'name', icon: User,  label: 'البحث بالاسم' },
          ] as const).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'relative flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors duration-200',
                tab === key
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
              {/* active indicator */}
              {tab === key && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="p-4">
          <AnimatePresence mode="wait">

            {/* ── Seat tab ── */}
            {tab === 'seat' && (
              <motion.div
                key="seat"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18 }}
                className="space-y-3"
              >
                <form
                  onSubmit={e => { e.preventDefault(); handleSeatSearch(); }}
                  className="space-y-3"
                >
                  {/* Input */}
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="أدخل رقم الجلوس..."
                      value={seatInput}
                      onChange={e => { setSeatInput(e.target.value); setSeatError(''); }}
                      dir="ltr"
                      className={cn(
                        'w-full h-12 text-lg text-center px-4 rounded-xl border-2 bg-background transition-all duration-200 outline-none',
                        'focus:border-primary focus:ring-4 focus:ring-primary/10',
                        'placeholder:text-muted-foreground/50 placeholder:text-base placeholder:text-right',
                        seatError
                          ? 'border-destructive focus:border-destructive focus:ring-destructive/10'
                          : 'border-border'
                      )}
                    />
                  </div>

                  <AnimatePresence>
                    {seatError && (
                      <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-1.5 text-destructive text-xs font-medium"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {seatError}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* CTA button */}
                  <motion.button
                    type="submit"
                    disabled={isSearchingSeat}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'w-full h-11 rounded-xl font-bold text-base text-white transition-all duration-200',
                      'flex items-center justify-center gap-2 relative overflow-hidden',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'shadow-md shadow-primary/30',
                    )}
                    style={{
                      background: 'linear-gradient(135deg, hsl(24 95% 50%), hsl(20 100% 60%))',
                    }}
                  >
                    {/* shimmer */}
                    <span className="absolute inset-0 pointer-events-none">
                      <motion.span
                        className="absolute inset-y-0 w-20 bg-white/20 skew-x-[-20deg]"
                        initial={{ left: '-30%' }}
                        animate={{ left: '130%' }}
                        transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                      />
                    </span>
                    {isSearchingSeat
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري البحث...</>
                      : <><Search className="w-4 h-4" /> عرض النتيجة</>
                    }
                  </motion.button>
                </form>

                {/* Recent searches */}
                <AnimatePresence>
                  {recentSeats.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="pt-1 space-y-2 border-t border-border/60"
                    >
                      <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 pt-2">
                        <Clock className="w-3 h-3" />
                        عمليات بحث سابقة
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {recentSeats.map(seat => (
                          <motion.button
                            key={seat}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSeatSearch(seat)}
                            className="px-3 py-1 bg-muted hover:bg-primary/10 hover:text-primary rounded-full text-xs font-semibold transition-colors border border-border/50"
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
            )}

            {/* ── Name tab ── */}
            {tab === 'name' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
                className="space-y-3"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="أدخل الاسم أو جزء منه..."
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="w-full h-12 text-base pr-10 pl-4 rounded-xl border-2 border-border bg-background transition-all duration-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {isSearchingName
                      ? <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      : <Search className="w-4 h-4" />}
                  </div>
                </div>

                {nameInput.length > 0 && nameInput.length < 2 && (
                  <p className="text-[11px] text-muted-foreground">أدخل حرفين على الأقل للبحث</p>
                )}

                <AnimatePresence>
                  {nameError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-center py-4 text-destructive text-xs">
                      {nameError}
                    </motion.p>
                  )}

                  {!isSearchingName && nameResults && nameResults.students.length === 0 && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-center py-6 text-muted-foreground text-sm">
                      لم يتم العثور على نتائج
                    </motion.p>
                  )}

                  {nameResults && nameResults.students.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                      <p className="text-[11px] text-muted-foreground font-medium">
                        {nameResults.total.toLocaleString('ar-EG')} نتيجة
                      </p>

                      <div className="space-y-1.5 max-h-72 overflow-y-auto">
                        {nameResults.students.map((student, i) => (
                          <motion.button
                            key={student.seatNumber}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => handleStudentClick(student)}
                            className="w-full group p-3 bg-background border border-border rounded-xl hover:border-primary/50 hover:shadow-sm transition-all text-right flex items-center justify-between gap-2 min-w-0"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm group-hover:text-primary transition-colors break-words leading-snug">
                                {student.arabicName}
                              </p>
                              <p className="text-muted-foreground text-[11px] mt-0.5 flex flex-wrap gap-2">
                                <span dir="ltr" className="font-mono">{student.seatNumber}</span>
                                <span className="text-muted-foreground/60">·</span>
                                <span dir="ltr">{student.totalDegree} درجة</span>
                              </p>
                            </div>
                            <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                          </motion.button>
                        ))}
                      </div>

                      {/* Pagination */}
                      {nameResults.total > nameResults.limit && (
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <button
                            disabled={page === 1}
                            onClick={() => handlePageChange(page - 1)}
                            className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            السابق
                          </button>
                          <span className="text-xs text-muted-foreground">{page}</span>
                          <button
                            disabled={page * nameResults.limit >= nameResults.total}
                            onClick={() => handlePageChange(page + 1)}
                            className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
