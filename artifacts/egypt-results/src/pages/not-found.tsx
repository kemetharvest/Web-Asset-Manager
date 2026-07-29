import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-6">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
      </div>
      
      <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
      
      <p className="text-xl text-muted-foreground max-w-md">
        عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      
      <Link href="/">
        <Button className="mt-8 h-14 px-8 text-lg rounded-xl shadow-lg">
          العودة للرئيسية
        </Button>
      </Link>
    </div>
  );
}
