export interface ActionResponse<T> {
  data?: T;
  error?: string;
}

export function getActionResponse<T>({
  data,
  error,
}: { data?: T; error?: unknown } = {}): ActionResponse<T> {
  if (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
  return { data };
}
