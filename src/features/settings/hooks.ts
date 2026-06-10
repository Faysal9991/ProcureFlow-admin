import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCompanySettings, updateCompanySettings } from "./api";

export const settingsQueryKeys = {
  all: ["company-settings"] as const,
  detail: () => ["company-settings", "detail"] as const,
};

export function useCompanySettings(enabled = true) {
  return useQuery({
    enabled,
    queryFn: getCompanySettings,
    queryKey: settingsQueryKeys.detail(),
  });
}

export function useUpdateCompanySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCompanySettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(settingsQueryKeys.detail(), settings);
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.all });
    },
  });
}
