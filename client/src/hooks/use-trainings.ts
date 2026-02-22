import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { GenerateTrainingInput } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useTrainings() {
  return useQuery({
    queryKey: [api.trainings.list.path],
    queryFn: async () => {
      const res = await fetch(api.trainings.list.path);
      if (!res.ok) throw new Error("Failed to fetch trainings");
      return await res.json();
    },
  });
}

export function useTraining(id: number) {
  return useQuery({
    queryKey: [api.trainings.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.trainings.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch training");
      return await res.json();
    },
    enabled: !!id,
  });
}

export function useGenerateTraining() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GenerateTrainingInput) => {
      const res = await fetch(api.trainings.generate.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to generate training");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.trainings.list.path] });
      toast({
        title: "Session Generated",
        description: "Your training session is ready!",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useGenerateFromPrompt() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { prompt: string }) => {
      const res = await fetch(api.trainings.generateFromPrompt.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to generate training");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.trainings.list.path] });
      toast({
        title: "Session Generated",
        description: "Your training session is ready!",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTraining() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.trainings.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete training");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.trainings.list.path] });
      toast({
        title: "Deleted",
        description: "Training session removed.",
      });
    },
  });
}
