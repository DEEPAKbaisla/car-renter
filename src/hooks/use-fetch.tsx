import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

type AsyncFn<TArgs extends unknown[], TResult> = (
  ...args: TArgs
) => Promise<TResult>;

const useFetch = <TResult, TArgs extends unknown[] = []>(
  cb: AsyncFn<TArgs, TResult>
) => {
  const [data, setData] = useState<TResult | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const invocationCount = useRef(0);

  const fn = useCallback(async (...args: TArgs): Promise<void> => {
    const callId = ++invocationCount.current;
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      if (callId !== invocationCount.current) return;
      setData(response);
      setError(null);
    } catch (err) {
      if (callId !== invocationCount.current) return;
      const error = err as Error;
      setError(error);
      toast.error(error.message);
    } finally {
      if (callId !== invocationCount.current) return;
      setLoading(false);
    }
  }, [cb]);

  return { data, loading, error, fn, setData };
};

export default useFetch;
