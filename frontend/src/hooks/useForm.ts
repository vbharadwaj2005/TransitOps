import { useState, ChangeEvent } from 'react';

interface UseFormReturn {
  values: Record<string, any>;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setValue: (name: string, value: any) => void;
  reset: () => void;
}

export function useForm(initialValues: Record<string, any> = {}): UseFormReturn {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const setValue = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return { values, errors, setErrors, handleChange, setValue, reset };
}
