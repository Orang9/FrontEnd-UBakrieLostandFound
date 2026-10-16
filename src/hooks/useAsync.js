import { useCallback, useState } from 'react';

export function useAsync(asyncFunction) {
  const [state, setState] = useState({
    data: null,
    error: null,
    loading: false,
  });

  const execute = useCallback(
    async (...args) => {
      setState({ data: null, error: null, loading: true });
      try {
        const data = await asyncFunction(...args);
        setState({ data, error: null, loading: false });
        return data;
      } catch (error) {
        setState({ data: null, error, loading: false });
        throw error;
      }
    },
    [asyncFunction],
  );

  return { ...state, execute };
}
