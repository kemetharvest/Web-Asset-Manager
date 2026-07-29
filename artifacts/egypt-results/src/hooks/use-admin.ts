import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGetAdminStatsQueryKey } from '@workspace/api-client-react';

const getAuthHeaders = () => {
  const token = localStorage.getItem('egypt_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export function useAdminStats() {
  return useQuery({
    queryKey: getGetAdminStatsQueryKey(),
    queryFn: async () => {
      const res = await fetch('/api/admin/stats', {
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('egypt_admin_token');
        }
        throw new Error('Failed to fetch stats');
      }
      return res.json();
    },
    retry: false
  });
}

export function useAdminUploadFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const token = localStorage.getItem('egypt_admin_token');
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(error.error || 'Upload failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/status'] });
    }
  });
}

export function useAdminDeleteData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/data', {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete data');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/status'] });
    }
  });
}
