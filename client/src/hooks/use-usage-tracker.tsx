import { useQuery } from "@tanstack/react-query";
import { getUserId } from "@/lib/storage";

export function useUsageTracker() {
  const { data: usage, isLoading, refetch } = useQuery({
    queryKey: ['/api/usage', getUserId()],
    refetchInterval: 30000, // Refetch every 30 seconds for faster updates
    staleTime: 0, // Always consider data stale for immediate updates
  });

  return {
    usage,
    isLoading,
    refetch, // Expose refetch function for manual updates
  };
}
