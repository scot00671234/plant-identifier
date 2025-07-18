import { useQuery } from "@tanstack/react-query";
import { getUserId } from "@/lib/storage";

export function useUsageTracker() {
  const { data: usage, isLoading } = useQuery({
    queryKey: ['/api/usage', getUserId()],
    refetchInterval: 60000, // Refetch every minute
  });

  return {
    usage,
    isLoading,
  };
}
