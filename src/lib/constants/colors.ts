export const colors = {
  background: "#F8F9FA",
  border: "#E5E7EB",
  error: "#DC2626",
  info: "#3B82F6",
  primary: "#E53935",
  primaryDark: "#C62828",
  success: "#22C55E",
  surface: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  warning: "#F59E0B",
} as const;

export type ColorName = keyof typeof colors;
