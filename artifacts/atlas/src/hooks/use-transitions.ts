import { useListTransitions, useCreateTransition } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export function useTransitions() {
  return useListTransitions();
}

export function useCreateTransitionPlan() {
  const queryClient = useQueryClient();
  
  return useCreateTransition({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/transitions"] });
      }
    }
  });
}
