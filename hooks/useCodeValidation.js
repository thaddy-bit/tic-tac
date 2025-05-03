import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function useCodeValidation() {
  const [isAllowed, setIsAllowed] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const code = localStorage.getItem('code_valide');
    const expiry = localStorage.getItem('code_expiry');
    const now = Date.now();

    if (!code || !expiry || now > parseInt(expiry, 10)) {
      localStorage.removeItem('code_valide');
      localStorage.removeItem('code_expiry');
      router.push('/code-verification');
      setIsAllowed(false);
    } else {
      setIsAllowed(true);
    }
  }, [router]);

  return isAllowed;
}