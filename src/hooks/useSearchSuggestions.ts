import { useState, useCallback, useEffect } from 'react';

interface DatabaseSuggestionsResponse {
  suggestions: string[];
  source: string;
  query: string;
  total_found: number;
  excluded_count?: number;
  error?: string;
}

interface UseSearchSuggestionsProps {
  apiUrl: string;
}

export const useSearchSuggestions = ({ 
  apiUrl
}: UseSearchSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    // Clear previous suggestions immediately
    setSuggestions([]);
    setLoading(true);
    setError(null);

    try {
      // Build query parameters - only query, no context
      const params = new URLSearchParams({
        q: query
      });

      console.log('Fetching suggestions:', { query, url: `${apiUrl}/search_suggestions?${params}` });

      const response = await fetch(`${apiUrl}/search_suggestions?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DatabaseSuggestionsResponse = await response.json();
      console.log('Received suggestions:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Extract suggestions from database response
      const extractedSuggestions = data.suggestions || [];
      setSuggestions(extractedSuggestions);
      
    } catch (err) {
      console.error('Search suggestions failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
      setSuggestions([]); // No fallback - just empty array
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  return {
    suggestions,
    loading,
    error,
    fetchSuggestions
  };
};