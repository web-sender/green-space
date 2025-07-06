import { useEffect } from 'react';
import { RefObject } from 'react';

interface IntersectionObserverOptions {
  once?: boolean;
  threshold?: number | number[];
}

export default function useIntersectionObserver(
  ref: RefObject<HTMLElement>,
  className: string,
  { once = true, threshold = 0.1 }: IntersectionObserverOptions = {}
): void {
  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current; // Сохраняем ref.current в переменную

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(className);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            entry.target.classList.remove(className);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element); // Используем сохранённую переменную
    };
  }, [ref, className, once, threshold]);
}