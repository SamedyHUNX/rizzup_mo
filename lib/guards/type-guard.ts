type ApiResponse = {
  success: boolean;
  message?: string;
  [key: string]: any;
};

export function isApiResponse(obj: any): obj is ApiResponse {
  return obj && typeof obj === "object" && "success" in obj;
}
