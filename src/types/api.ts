export interface ApiError {
    message: string;
    error?: string;
    statusCode: number;
  }
  
  export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: ApiError;
    timestamp?: string;
  }
  