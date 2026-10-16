import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Toast } from '../../components/ui/Toast.jsx';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const dismiss = useCallback(() => setToast(null), []);
  const notify = useCallback((message, variant = 'info') => {
    setToast({ message, variant, id: Date.now() });
  }, []);
  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && <Toast key={toast.id} {...toast} onDismiss={dismiss} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider.');
  return context;
}
