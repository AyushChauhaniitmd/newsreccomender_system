import { createContext, useContext, useState, ReactNode } from 'react';

interface SearchContextValue {
  query: string;
  setQuery: (v: string) => void;
  suggestions: string[];
  setSuggestions: (v: string[]) => void;
  onSearch: (() => void) | null;
  setOnSearch: (fn: () => void) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function HyperNewsSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [onSearch, setOnSearchFn] = useState<(() => void) | null>(null);
  const [loading, setLoading] = useState(false);

  const setOnSearch = (fn: () => void) => {
    setOnSearchFn(() => fn);
  };

  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        suggestions,
        setSuggestions,
        onSearch,
        setOnSearch,
        loading,
        setLoading,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useHyperNewsSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useHyperNewsSearch must be used within HyperNewsSearchProvider');
  }
  return context;
}
