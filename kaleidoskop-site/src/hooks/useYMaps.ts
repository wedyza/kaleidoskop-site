// src/hooks/useYMaps.ts
import { useEffect, useState } from 'react';

export function useYMaps(apiKey?: string) {
  const [ready, setReady] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // если уже загружено
    if ((window as any).ymaps) {
      // ymaps может ещё инициализироваться — ждём ready
      (window as any).ymaps.ready(() => setReady(true));
      return;
    }

    // создаём тег скрипта
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
      // не удаляем script, оставляем кэшированным. Можно при необходимости удалить:
      // document.head.removeChild(script);
    };
  }, [apiKey]);

  return { ready, error };
}
