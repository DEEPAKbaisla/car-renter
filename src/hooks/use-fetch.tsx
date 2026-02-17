import { useState } from "react";
import { toast } from "sonner";

type AsyncFn<TArgs extends any[], TResult> = (
  ...args: TArgs
) => Promise<TResult>;

const useFetch = <TResult, TArgs extends any[] = []>(
  cb: AsyncFn<TArgs, TResult>
) => {
  const [data, setData] = useState<TResult | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: TArgs): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;
