import { useCallback, useEffect, useState } from 'react';

/**
 * The signed-in operator's display name.
 *
 * Local only. There is no account, no session and no credential — this exists
 * so the console's avatar and greeting can show something other than a
 * placeholder once you have been through the sign-in screen.
 */

const KEY = 'kessler.operator';

export interface Operator {
  name: string;
  workspace: string;
}

export const DEMO_OPERATOR: Operator = { name: 'Demo Operator', workspace: 'Sandbox' };

const read = (): Operator | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Operator) : null;
  } catch {
    return null;
  }
};

/** Two-letter monogram for the top-bar avatar. */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || 'SO';

export function useOperator() {
  const [operator, setOperator] = useState<Operator | null>(read);

  useEffect(() => {
    const sync = () => setOperator(read());
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const signIn = useCallback((next: Operator) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    setOperator(next);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(KEY);
    setOperator(null);
  }, []);

  return { operator, signIn, signOut };
}
