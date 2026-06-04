import AppRouter from './router';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import { authApi } from './api/index';

export default function App() {
  // const token = useAuthStore((s) => s.token);

  // useEffect(() => {
  //   if (token) {
  //     authApi.me();
  //   }
  // }, []);
  return <AppRouter />;
}
