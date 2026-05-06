export type SuccessResponse<T = unknown> = {
  success: true
  data: T
}

export type ErrorResponse = {
  success: false
  error: string
  code?: string
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse

export function successResponse<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
  }
}

export function errorResponse(error: string, code?: string): ErrorResponse {
  return {
    success: false,
    error,
    code,
  }
}
