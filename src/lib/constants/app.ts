export const APP_CONFIG = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1",
  description: "Admin console for ProcureFlow procurement operations.",
  name: "ProcureFlow Admin",
  swaggerUrl:
    process.env.NEXT_PUBLIC_SWAGGER_URL ??
    "http://localhost:8080/swagger/index.html",
} as const;
