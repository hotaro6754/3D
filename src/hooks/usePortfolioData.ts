import { useMemo } from 'react';
import type { PortfolioContent } from '../data/types';
import contentData from '../data/content.json';

export function usePortfolioData(): PortfolioContent {
  return useMemo(() => {
    return contentData as PortfolioContent;
  }, []);
}
