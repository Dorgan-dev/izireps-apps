import { useState, useEffect, useCallback } from "react";
import { ownerDashboardApi } from "../services/api";

/**
 * Hook untuk mengambil data dashboard owner.
 * Auto-refresh setiap `interval` milidetik (default: 60 detik).
 */
export function useOwnerDashboard(interval = 60000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await ownerDashboardApi.getData();
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message ?? "Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, interval);
    return () => clearInterval(timer);
  }, [fetchData, interval]);

  return { data, loading, error, refetch: fetchData };
}
