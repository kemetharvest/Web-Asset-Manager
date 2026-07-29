import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, User, Hash, Clock, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchByName } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<'seat' | 'name'>('seat');
  
  // Seat Search
  const [seatInput, setSeatInput] = useState('');
  const [seatError, setSeatError] = useState('');
  const [recentSeats, setRecentSearches] = useState<number[]>([]);
  
  // Name Search
  const [nameInput, setNameInput] = useState('');
  const [searchedName, setSearchedName] = useState('');
  const [page, setPage] = useState(1);


  useEffect(() => {
    const saved = localStorage.getItem('egypt_recent_seats');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveRecentSearch = (seat: number) => {
    const updated = [seat, ...recentSeats.filter(s => s !== seat)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('egypt_recent_seats', JSON.stringify(updated));
  };

  const [isSearchingSeat, setIsSearchingSeat] = useState(false);
  const handleSeatSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!seatInput || isNaN(Number(seatInput))) {
      setSeatError('الرجاء إدخال رقم جلوس صحيح');
      return;
    }
    
    setSeatError('');
    setIsSearchingSeat(true);
    
    const seatNumber = Number(seatInput);
    try {
      // Instead of relying purely on useQuery, we fetch it manually to handle navigation safely
      const res = await fetch(`/api/results/${seatNumber}`);
      if (res.ok) {
        saveRecentSearch(seatNumber);
        setLocation(`/result/${seatNumber}`);
      } else {
        setSeatError('عذراً، لم يتم العثور على أي نتيجة');
      }
    } catch (err) {
      setSeatError('حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSearchingSeat(false);
    }
  };

  const handleRecentClick = (seat: number) => {
    setSeatInput(seat.toString());
    // Auto submit
    setTimeout(() => {
      const form = document.getElementById('seat-form');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 0);
  };

  const handleNameSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setPage(1);
    setSearchedName(nameInput.trim());
  };

  const { data: nameResults, isLoading: isNameLoading, isError: isNameError } = useSearchByName(
    { name: searchedName, page, limit: 10 },
    { query: { enabled: !!searchedName, queryKey: ['/api/results/search', { name: searchedName, page, limit: 10 }] } }
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <section className="text-center space-y-4 pt-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary drop-shadow-sm"
        >
          نتيجة الثانوية العامة
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-muted-foreground"
        >
          يمكنك الاستعلام عن النتيجة باستخدام رقم الجلوس أو الاسم
        </motion.p>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-none shadow-xl bg-card/60 backdrop-blur-xl">
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'seat' | 'name')} className="w-full">
            <CardHeader className="pb-2">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                <TabsTrigger value="seat" className="text-base py-3 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Hash className="w-4 h-4 ml-2" />
                  رقم الجلوس
                </TabsTrigger>
                <TabsTrigger value="name" className="text-base py-3 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <User className="w-4 h-4 ml-2" />
                  الاسم
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-6">
              
              <AnimatePresence mode="wait">
                {tab === 'seat' && (
                  <motion.div
                    key="seat"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <form id="seat-form" onSubmit={handleSeatSearch} className="max-w-md mx-auto space-y-6">
                      <div className="space-y-2">
                        <div className="relative">
                          <Input 
                            type="number" 
                            placeholder="أدخل رقم الجلوس..." 
                            className="h-16 text-xl px-6 rounded-2xl bg-background border-2 focus-visible:ring-0 focus-visible:border-primary transition-colors text-center"
                            value={seatInput}
                            onChange={(e) => setSeatInput(e.target.value)}
                            dir="ltr"
                          />
                        </div>
                        {seatError && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-sm font-medium text-center">
                            {seatError}
                          </motion.p>
                        )}
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isSearchingSeat}
                        className="w-full h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        {isSearchingSeat ? <Loader2 className="w-6 h-6 animate-spin" /> : 'عرض النتيجة'}
                      </Button>

                      {recentSeats.length > 0 && (
                        <div className="pt-6 space-y-3 border-t">
                          <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4" />
                            عمليات بحث سابقة
                          </p>
                          <div className="flex flex-wrap justify-center gap-2">
                            {recentSeats.map(seat => (
                              <button
                                key={seat}
                                type="button"
                                onClick={() => handleRecentClick(seat)}
                                className="px-4 py-2 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-full text-sm font-semibold transition-colors"
                              >
                                {seat}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </form>
                  </motion.div>
                )}

                {tab === 'name' && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <form onSubmit={handleNameSearch} className="max-w-md mx-auto space-y-6">
                      <div className="relative">
                        <Input 
                          type="text" 
                          placeholder="أدخل الاسم أو جزء منه..." 
                          className="h-16 text-xl pr-14 rounded-2xl bg-background border-2 focus-visible:ring-0 focus-visible:border-primary transition-colors"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                        />
                        <Search className="w-6 h-6 text-muted-foreground absolute right-5 top-1/2 -translate-y-1/2" />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isNameLoading}
                        className="w-full h-14 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        {isNameLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'بحث'}
                      </Button>
                    </form>

                    <div className="mt-10">
                      {isNameLoading && (
                        <div className="space-y-3">
                          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                        </div>
                      )}

                      {!isNameLoading && isNameError && (
                        <div className="text-center p-8 bg-destructive/10 rounded-2xl">
                          <p className="text-destructive font-medium">عذراً، لم يتم العثور على أي نتيجة</p>
                        </div>
                      )}

                      {!isNameLoading && nameResults && nameResults.students.length > 0 && (
                        <div className="space-y-6">
                          <p className="text-sm text-muted-foreground font-medium text-center">
                            تم العثور على {nameResults.total} نتيجة
                          </p>
                          <div className="grid gap-3">
                            {nameResults.students.map((student, i) => (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={student.seatNumber}
                                onClick={() => {
                                  saveRecentSearch(student.seatNumber);
                                  setLocation(`/result/${student.seatNumber}`);
                                }}
                                className="group p-4 bg-background border rounded-xl hover:border-primary hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                              >
                                <div>
                                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{student.arabicName}</h3>
                                  <p className="text-muted-foreground text-sm flex gap-4 mt-1">
                                    <span>رقم الجلوس: <span className="font-semibold text-foreground">{student.seatNumber}</span></span>
                                    <span>المجموع: <span className="font-semibold text-foreground">{student.totalDegree}</span></span>
                                  </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                  <ArrowLeft className="w-5 h-5" />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                          
                          {nameResults.total > nameResults.limit && (
                            <div className="flex justify-center gap-2 pt-4">
                              <Button 
                                variant="outline" 
                                disabled={page === 1} 
                                onClick={() => setPage(p => p - 1)}
                              >
                                السابق
                              </Button>
                              <div className="flex items-center px-4 font-medium text-sm">
                                صفحة {page}
                              </div>
                              <Button 
                                variant="outline" 
                                disabled={page * nameResults.limit >= nameResults.total} 
                                onClick={() => setPage(p => p + 1)}
                              >
                                التالي
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {!isNameLoading && nameResults && nameResults.students.length === 0 && (
                        <div className="text-center p-8 bg-muted rounded-2xl">
                          <p className="text-muted-foreground font-medium">عذراً، لم يتم العثور على أي نتيجة مطابقة</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}
