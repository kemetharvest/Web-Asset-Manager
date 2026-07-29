import { useParams, Link } from 'wouter';
import { motion } from 'framer-motion';
import { useGetResultBySeat, getGetResultBySeatQueryKey } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Printer, Copy, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function CircularProgress({ value, colorClass }: { value: number, colorClass: string }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          className="text-muted stroke-current"
          strokeWidth="8"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
        />
        <motion.circle
          className={`${colorClass} stroke-current`}
          strokeWidth="8"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-sans" dir="ltr">{value.toFixed(1)}%</span>
      </div>
    </div>
  );
}

export default function Result() {
  const params = useParams();
  const seatNumber = Number(params.seatNumber);
  const { toast } = useToast();

  const { data: student, isLoading, isError } = useGetResultBySeat(seatNumber, {
    query: {
      enabled: !!seatNumber,
      queryKey: getGetResultBySeatQueryKey(seatNumber)
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pt-8">
        <div className="flex gap-4">
          <Skeleton className="w-24 h-10 rounded-lg" />
        </div>
        <Skeleton className="w-full h-[400px] rounded-2xl" />
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="max-w-xl mx-auto pt-20 text-center space-y-6">
        <div className="w-24 h-24 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold">عذراً، لم يتم العثور على نتيجة</h2>
        <p className="text-muted-foreground text-lg">تأكد من كتابة رقم الجلوس بشكل صحيح وحاول مرة أخرى.</p>
        <Link href="/">
          <Button className="mt-8 h-12 px-8 text-lg rounded-xl">العودة للبحث</Button>
        </Link>
      </div>
    );
  }

  const MAX_DEGREE = 410;
  const percentage = (student.totalDegree / MAX_DEGREE) * 100;
  
  const isPass = student.studentCaseDesc.includes('ناجح');
  const statusColor = isPass ? 'text-success' : 'text-destructive';
  const statusBg = isPass ? 'bg-success/10' : 'bg-destructive/10';
  const icon = isPass ? <CheckCircle2 className={`w-8 h-8 ${statusColor}`} /> : <XCircle className={`w-8 h-8 ${statusColor}`} />;

  const copyResult = () => {
    const text = `نتيجة الثانوية العامة\nالاسم: ${student.arabicName}\nرقم الجلوس: ${student.seatNumber}\nالمجموع: ${student.totalDegree} من ${MAX_DEGREE} (${percentage.toFixed(2)}%)\nالحالة: ${student.studentCaseDesc}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: "تم نسخ النتيجة إلى الحافظة",
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pt-4 pb-12">
      <div className="flex items-center justify-between no-print">
        <Link href="/">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowRight className="w-4 h-4" />
            بحث جديد
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={copyResult} title="نسخ النتيجة">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => window.print()} title="طباعة">
            <Printer className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="print-card bg-card border shadow-xl rounded-3xl overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary via-secondary to-accent"></div>
        
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8 border-b pb-8">
            <div className="flex-1 text-center md:text-right space-y-4">
              <p className="text-sm font-bold tracking-widest text-accent uppercase">بطاقة نتيجة طالب</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
                {student.arabicName}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-muted text-muted-foreground font-semibold text-sm">
                  رقم الجلوس: <span className="ml-1 mr-2 text-foreground font-bold text-base" dir="ltr">{student.seatNumber}</span>
                </span>
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${statusBg} ${statusColor} font-bold text-sm`}>
                  {icon}
                  {student.studentCaseDesc}
                </span>
              </div>
            </div>
            
            <div className="flex-shrink-0 flex flex-col items-center">
              <CircularProgress value={percentage} colorClass={statusColor} />
              <p className="mt-4 text-center text-muted-foreground font-medium">
                المجموع: <span className="text-foreground font-bold text-xl mx-1" dir="ltr">{student.totalDegree}</span><span className="text-sm">/ 410</span>
              </p>
            </div>
          </div>

          <div className="pt-8 space-y-6">
            <div className="bg-muted/50 rounded-2xl p-6 text-center text-sm text-muted-foreground">
              هذه النتيجة استرشادية ولا تغني عن الشهادة الرسمية المعتمدة من المدرسة.
            </div>
          </div>
        </div>
        
        {/* Official seal/watermark decoration */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      </motion.div>
    </div>
  );
}
