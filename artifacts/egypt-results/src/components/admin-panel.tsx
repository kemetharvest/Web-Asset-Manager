'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, UploadCloud, Trash2, Users, Target, CheckCircle, ShieldAlert, LogOut, FileText, TrendingUp, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { adminLogin, getAdminStats, uploadExcel, deleteAllData } from '@/lib/api';
import type { AdminStats } from '@/types';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

function StatCard({ title, value, icon: Icon, color, subtitle }: {
  title: string; value: string | number; icon: React.ElementType; color: string; subtitle?: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="p-6 rounded-2xl glass glass-border space-y-3 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold" dir="ltr">{typeof value === 'number' ? value.toLocaleString('ar-EG') : value}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </motion.div>
  );
}

function LoginPanel({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token } = await adminLogin(password);
      localStorage.setItem('egypt_admin_token', token);
      onSuccess();
      toast.success('تم تسجيل الدخول بنجاح');
    } catch {
      setError('كلمة المرور غير صحيحة');
      toast.error('فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-24">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="rounded-3xl glass glass-border shadow-2xl p-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">بوابة الإدارة</h1>
          <p className="text-sm text-muted-foreground">أدخل كلمة المرور للوصول إلى لوحة التحكم</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            dir="ltr"
            className="w-full h-14 text-center text-lg px-6 rounded-2xl border-2 border-input bg-background transition-all outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          {error && <p className="text-destructive text-sm text-center font-medium">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shine"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري التحقق...</> : 'دخول'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err: unknown) {
      if ((err as Error).message === 'unauthorized') {
        onLogout();
      }
    } finally {
      setLoadingStats(false);
    }
  }, [onLogout]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);

    // Fake progress animation
    const interval = setInterval(() => {
      setUploadProgress(p => Math.min(p + Math.random() * 15, 85));
    }, 400);

    try {
      const result = await uploadExcel(file);
      clearInterval(interval);
      setUploadProgress(100);
      toast.success(`تم رفع الملف بنجاح — ${result.count.toLocaleString('ar-EG')} طالب`);
      setTimeout(() => { setUploadProgress(0); fetchStats(); }, 1000);
    } catch (err: unknown) {
      clearInterval(interval);
      toast.error((err as Error).message || 'فشل رفع الملف');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAllData();
      toast.success('تم مسح جميع البيانات');
      fetchStats();
    } catch {
      toast.error('فشل مسح البيانات');
    } finally {
      setDeleting(false);
    }
  };

  const passRate = stats && stats.totalStudents > 0
    ? Math.round((stats.passedCount / stats.totalStudents) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pt-8 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة بيانات نتائج الطلاب</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          <LogOut className="w-4 h-4" />
          تسجيل خروج
        </button>
      </div>

      {/* Stats */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
          ))
        ) : stats ? (
          <>
            <StatCard title="إجمالي الطلاب" value={stats.totalStudents} icon={Users} color="bg-primary/10 text-primary" />
            <StatCard title="الناجحون" value={stats.passedCount} icon={CheckCircle} color="bg-success/10 text-success" subtitle={`${passRate}% من الإجمالي`} />
            <StatCard title="متوسط المجموع" value={stats.averageScore?.toFixed(1) ?? '—'} icon={Target} color="bg-accent/10 text-accent" />
            <StatCard title="أعلى مجموع" value={stats.highestScore} icon={TrendingUp} color="bg-secondary/10 text-secondary" />
          </>
        ) : null}
      </motion.div>

      {/* Pass rate bar */}
      {stats && stats.totalStudents > 0 && (
        <motion.div variants={fadeUp} className="rounded-2xl glass glass-border p-6 space-y-3">
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" />نسبة النجاح</span>
            <span dir="ltr">{passRate}%</span>
          </div>
          <Progress value={passRate} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>الناجحون: {stats.passedCount.toLocaleString('ar-EG')}</span>
            <span>الراسبون: {stats.failedCount.toLocaleString('ar-EG')}</span>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload */}
        <motion.div variants={fadeUp} className="rounded-2xl glass glass-border p-6 space-y-4">
          <div className="flex items-center gap-2 font-semibold">
            <FileText className="w-5 h-5 text-primary" />
            رفع ملف النتائج
          </div>
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="border-2 border-dashed border-primary/20 hover:border-primary/50 transition-colors rounded-2xl p-8 text-center bg-background/50 cursor-pointer"
          >
            <UploadCloud className="w-10 h-10 text-primary/60 mx-auto mb-3" />
            <p className="font-semibold text-sm mb-1">اضغط لاختيار ملف Excel</p>
            <p className="text-xs text-muted-foreground">xlsx أو xls — حد أقصى 200MB</p>
          </div>
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">جاري الرفع...</span>
                <span dir="ltr">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
        </motion.div>

        {/* Delete */}
        <motion.div variants={fadeUp} custom={1} className="rounded-2xl glass glass-border p-6 space-y-4 border-destructive/20">
          <div className="flex items-center gap-2 font-semibold text-destructive">
            <Trash2 className="w-5 h-5" />
            مسح قاعدة البيانات
          </div>
          <p className="text-sm text-muted-foreground">
            سيتم حذف جميع بيانات الطلاب نهائياً. هذا الإجراء لا يمكن التراجع عنه.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={deleting}
                className="w-full h-12 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 font-semibold text-sm hover:bg-destructive hover:text-destructive-foreground transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                حذف جميع البيانات
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف جميع بيانات {stats?.totalStudents?.toLocaleString('ar-EG')} طالب نهائياً ولا يمكن استعادتها.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  تأكيد الحذف
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </div>
    </div>
  );
}

export function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(!!localStorage.getItem('egypt_admin_token'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('egypt_admin_token');
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <LoginPanel onSuccess={() => setAuthenticated(true)} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}
