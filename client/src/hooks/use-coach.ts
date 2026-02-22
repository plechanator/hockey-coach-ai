import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { InsertCoachProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCoachProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [api.coachProfile.get.path],
    queryFn: async () => {
      const res = await fetch(api.coachProfile.get.path);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return await res.json();
    },
  });

  const createOrUpdate = useMutation({
    mutationFn: async (data: Omit<InsertCoachProfile, "userId">) => {
      const res = await fetch(api.coachProfile.createOrUpdate.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.coachProfile.get.path] });
      toast({
        title: "Profile Updated",
        description: "Your coaching DNA has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  return { ...query, createOrUpdate };
}
