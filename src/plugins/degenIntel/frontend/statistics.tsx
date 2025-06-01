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
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data && typeof data.chains !== 'undefined') {
              return data;
            }
          }
        } catch (error) {
          console.log(`Statistics API ${endpoint} not available`);
        }
      }

      // Fallback to mock data if no backend available
      return {
        tweets: 0,
        sentiment: 0,
        tokens: 0,
        chains: 0
      };
    },
    retry: 1,
    refetchInterval: 30000,
  });

  return (
    <div className="py-4 w-full bg-muted">
      <div className="container flex items-center gap-4">
        {query?.isPending ? (
          <div className="text-sm animate-pulse">Loading statistics...</div>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            <span>📚 Tweets {query?.data?.tweets || 0}</span>
            <span className="text-muted">•</span>
            <span>🌍 Sentiment {query?.data?.sentiment || 0}</span>
            <span className="text-muted">•</span>
            <span>💸 Tokens {query?.data?.tokens || 0}</span>
            <span className="text-muted">•</span>
            <span>⛓️ Chains {query?.data?.chains || 0}</span>
          </div>
        )}
      </div>
    </div>
  );
}
