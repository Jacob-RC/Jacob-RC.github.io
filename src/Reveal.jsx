import { useEffect, useRef, useState } from 'react';

export default function Reveal({ as: Tag = 'div', className = '', children, ...props }) {
  const ref = useRef(null);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches || !('IntersectionObserver' in window)) return;
    const element = ref.current;
    if (element.getBoundingClientRect().top <= window.innerHeight) return;
    setPending(true);
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setPending(false);
        observer.disconnect();
      }
    }, { rootMargin: '0px 0px -24px 0px' });
    const show = () => { setPending(false); observer.disconnect(); };
    observer.observe(element);
    media.addEventListener('change', show);
    window.addEventListener('beforeprint', show);
    return () => {
      observer.disconnect();
      media.removeEventListener('change', show);
      window.removeEventListener('beforeprint', show);
    };
  }, []);
  return <Tag {...props} ref={ref} className={`${className}${pending ? ' reveal-pending' : ''}`} onFocusCapture={() => setPending(false)}>{children}</Tag>;
}
