import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export const useColorScheme = () => {
  const [hasHydrated, setHasHydrated] = useState(false);

  const hydrate = () => {
    setHasHydrated(true);
  };

  useEffect(() => {
    hydrate();
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
};
