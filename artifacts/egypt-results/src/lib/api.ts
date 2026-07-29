import type { Student, StudentSearchResult, AdminStats, DataStatus, AdminToken } from '@/types';

const API_BASE = '/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('egypt_admin_token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchResultBySeat(seatNumber: number): Promise<Student> {
  const res = await fetch(`${API_BASE}/results/${seatNumber}`);
  if (!res.ok) throw new Error('لم يتم العثور على نتيجة');
  return res.json();
}

export async function searchByName(
  name: string,
  page = 1,
  limit = 20
): Promise<StudentSearchResult> {
  const params = new URLSearchParams({ name, page: String(page), limit: String(limit) });
  const res = await fetch(`${API_BASE}/results/search?${params}`);
  if (!res.ok) throw new Error('فشل البحث');
  return res.json();
}

export async function getDataStatus(): Promise<DataStatus> {
  const res = await fetch(`${API_BASE}/admin/status`);
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function adminLogin(password: string): Promise<AdminToken> {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error('كلمة المرور غير صحيحة');
  return res.json();
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/admin/stats`, { headers: authHeaders() });
  if (res.status === 401) {
    localStorage.removeItem('egypt_admin_token');
    throw new Error('unauthorized');
  }
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function uploadExcel(file: File): Promise<{ count: number; message: string }> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/admin/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Upload failed');
  }
  return res.json();
}

export async function deleteAllData(): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/admin/data`, {
    method: 'DELETE',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to delete data');
  return res.json();
}
