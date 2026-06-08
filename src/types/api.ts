export type ApiResponse<T> = {
  data: T;
  message?: string;
  success: boolean;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type ApiErrorPayload = {
  code?: string;
  details?: Record<string, unknown>;
  error?: string;
  errors?: unknown;
  message?: string;
  statusCode?: number;
};

export type SelectOption<TValue extends string | number = string> = {
  label: string;
  value: TValue;
};
