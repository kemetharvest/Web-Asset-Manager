import { useState, useRef } from 'react';
import { useAdminLogin } from '@workspace/api-client-react';
import { useAdminStats, useAdminUploadFile, useAdminDeleteData } from '@/hooks/use-admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UploadCloud, Trash2, Users, Target, ShieldAlert, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion } from 'framer-motion';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('egypt_admin_token'));
  
  const loginMutation = useAdminLogin();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { password } }, {
      onSuccess: (data) => {
        localStorage.setItem('egypt_admin_token', data.token);
        setIsAuthenticated(true);
        toast({ title: 'تم تسجيل الدخول بنجاح' });
      },
      onError: () => {
        toast({ title: 'كلمة المرور غير صحيحة', variant: 'destructive' });
      }
    });
  };

  const logout = () => {
    localStorage.removeItem('egypt_admin_token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto pt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-md">
            <CardHeader className="text-center pb-8 pt-10">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">تسجيل دخول الإدارة</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Input 
                    type="password" 
                    placeholder="كلمة المرور" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 text-center text-lg"
                    dir="ltr"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'دخول'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return <AdminDashboard onLogout={logout} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { data: stats, isLoading, isError } = useAdminStats();
  const uploadMutation = useAdminUploadFile();
  const deleteMutation = useAdminDeleteData();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file, {
        onSuccess: (res: any) => {
          toast({ title: 'تم الرفع بنجاح', description: res.message });
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
        onError: (err) => {
          toast({ title: 'فشل الرفع', description: err.message, variant: 'destructive' });
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      });
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        toast({ title: 'تم مسح البيانات بنجاح' });
      },
      onError: (err) => {
        toast({ title: 'فشل مسح البيانات', description: err.message, variant: 'destructive' });
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">لوحة التحكم</h1>
        <Button variant="outline" onClick={onLogout}>تسجيل خروج</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/30">
          <CardContent className="pt-6">
            <div className="border-2 border-dashed border-primary/20 hover:border-primary/50 transition-colors rounded-2xl p-8 text-center bg-background/50">
              <UploadCloud className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">رفع ملف النتائج</h3>
              <p className="text-muted-foreground text-sm mb-6">صيغة Excel (xlsx) مدعومة فقط</p>
              
              <input 
                type="file" 
                accept=".xlsx" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
                className="w-full sm:w-auto h-12 px-8"
              >
                {uploadMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري الرفع...</>
                ) : (
                  'اختر الملف'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-destructive/5 to-card border-destructive/10">
          <CardContent className="pt-6 flex flex-col justify-center items-center h-full text-center space-y-6">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
              <Trash2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">مسح قاعدة البيانات</h3>
              <p className="text-muted-foreground text-sm">سيتم مسح جميع نتائج الطلاب نهائياً.</p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="h-12 px-8 w-full sm:w-auto" disabled={deleteMutation.isPending}>
                  {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حذف جميع البيانات'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    هذا الإجراء لا يمكن التراجع عنه. سيتم مسح جميع بيانات الطلاب من قاعدة البيانات نهائياً.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0">
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    تأكيد الحذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          إحصائيات البيانات
        </h2>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Card key={i} className="h-32"><CardContent className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></CardContent></Card>)}
          </div>
        ) : isError || !stats ? (
          <Card className="bg-destructive/10 border-none"><CardContent className="pt-6 text-center text-destructive font-medium">فشل تحميل الإحصائيات</CardContent></Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="إجمالي الطلاب" value={stats.totalStudents} icon={<Users className="w-5 h-5 text-blue-500" />} />
            <StatCard title="متوسط المجموع" value={stats.averageScore ? stats.averageScore.toFixed(2) : 0} icon={<Target className="w-5 h-5 text-purple-500" />} />
            <StatCard title="الناجحين" value={stats.passedCount} icon={<CheckCircle className="w-5 h-5 text-success" />} />
            <StatCard title="الراسبين / أخرى" value={stats.failedCount} icon={<Trash2 className="w-5 h-5 text-destructive" />} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-2 bg-muted rounded-lg">{icon}</div>
        </div>
        <p className="text-3xl font-bold font-sans" dir="ltr">{value}</p>
      </CardContent>
    </Card>
  );
}
