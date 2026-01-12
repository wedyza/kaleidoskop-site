import { useEffect, useState } from 'react';

export function useYMaps(apiKey?: string) {
  const [ready, setReady] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).ymaps) {
      (window as any).ymaps.ready(() => setReady(true));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey ?? ''}&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      if ((window as any).ymaps) {
        (window as any).ymaps.ready(() => setReady(true));
      } else {
        setError(new Error('Yandex Maps loaded but ymaps not found'));
      }
    };
    script.onerror = () => {
      setError(new Error('Failed to load yandex maps script'));
    };
    document.head.appendChild(script);

    return () => {
    };
  }, [apiKey]);

  return { ready, error };
}
