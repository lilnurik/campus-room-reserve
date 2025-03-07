
import { useState, useEffect } from 'react';

// useMediaQuery hook for responsive design
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  
  return matches;
};

// Hook to detect mobile devices
export const useMobile = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return isMobile;
};

export default useMobile;
