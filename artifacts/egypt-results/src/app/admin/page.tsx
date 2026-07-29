import type { Metadata } from 'next';
import { AdminPanel } from '@/components/admin-panel';

export const metadata: Metadata = {
  title: 'لوحة التحكم',
  description: 'لوحة تحكم الإدارة — بوابة الثانوية العامة',
};

export default function AdminPage() {
  return <AdminPanel />;
}
