import { ZodError } from "zod"

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = "AppError"
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED")
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN")
    this.name = "ForbiddenError"
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Not found") {
    super(message, 404, "NOT_FOUND")
    this.name = "NotFoundError"
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed") {
    super(message, 400, "VALIDATION_ERROR")
    this.name = "ValidationError"
  }
}

export function handleError(error: unknown): {
  success: false
  error: string
  code?: string
} {
  console.error("Error:", error)

  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    }
  }

  if (error instanceof ZodError) {
    return {
      success: false,
      error: error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
      code: "VALIDATION_ERROR",
    }
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: false,
    error: "An unexpected error occurred",
  }
}
