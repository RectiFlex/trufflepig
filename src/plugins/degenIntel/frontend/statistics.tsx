import { useQuery } from '@tanstack/react-query';

export default function Statistics() {
  const query = useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
      // Try multiple endpoints to get real statistics
      const endpoints = [
        'http://localhost:3001/statistics',
        '/statistics'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            mode: 'cors', // Explicitly allow CORS
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Statistics loaded from ${endpoint}:`, data);
            if (data && typeof data.chains !== 'undefined') {
              return data;
            }
          } else {
            console.log(`❌ Statistics endpoint ${endpoint} returned ${response.status}`);
          }
        } catch (error) {
          console.log(`❌ Statistics API ${endpoint} not available:`, error);
        }
      }

      // Fallback to mock data if no backend available
      console.log('🔄 Using fallback statistics data');
      return {
        tweets: 0,
        sentiment: 0,
        tokens: 0,
        chains: 0
      };
    },
    retry: 2,
    refetchInterval: 30000,
  });

  return (
    <div className="py-4 w-full bg-muted">
      <div className="container flex items-center gap-4">
        {query?.isPending ? (
          <div className="text-sm animate-pulse">🔄 Loading live statistics...</div>
        ) : query?.isError ? (
          <div className="text-sm text-yellow-600">⚠️ Statistics temporarily unavailable - retrying...</div>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            <span>📚 Tweets {query?.data?.tweets || 0}</span>
            <span className="text-muted">•</span>
            <span>🌍 Sentiment {query?.data?.sentiment || 0}</span>
            <span className="text-muted">•</span>
            <span>💸 Tokens {query?.data?.tokens || 0}</span>
            <span className="text-muted">•</span>
            <span>⛓️ Chains {query?.data?.chains || 0}</span>
            <span className="text-xs text-green-600 ml-2">✅ Live</span>
          </div>
        )}
      </div>
    </div>
  );
}
