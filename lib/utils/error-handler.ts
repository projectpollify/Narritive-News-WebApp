import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

export interface ApiError {
  success: false
  error: string
  details?: unknown
  statusCode: number
}

export interface ApiSuccess<T = unknown> {
  success: true
  data: T
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

// Standard error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Bad request',
  INTERNAL_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation error',
  DATABASE_ERROR: 'Database operation failed',
  RATE_LIMIT: 'Too many requests',
  INVALID_CREDENTIALS: 'Invalid credentials',
} as const

// Log error (in production, this would go to an error tracking service)
export function logError(error: unknown, context?: Record<string, unknown>) {
  const timestamp = new Date().toISOString()
  const errorInfo = {
    timestamp,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
  }

  if (process.env.NODE_ENV === 'production') {
    // In production, send to error tracking service (e.g., Sentry)
    console.error('[ERROR]', JSON.stringify(errorInfo))
  } else {
    // In development, log to console with formatting
    console.error('\x1b[31m%s\x1b[0m', `[ERROR] ${timestamp}`)
    console.error(error)
    if (context) {
      console.error('Context:', context)
    }
  }
}

// Handle Prisma errors
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): ApiError {
  switch (error.code) {
    case 'P2002':
      return {
        success: false,
        error: 'A record with this value already exists',
        details: error.meta,
        statusCode: 409,
      }
    case 'P2025':
      return {
        success: false,
        error: 'Record not found',
        details: error.meta,
        statusCode: 404,
      }
    case 'P2003':
      return {
        success: false,
        error: 'Foreign key constraint failed',
        details: error.meta,
        statusCode: 400,
      }
    default:
      return {
        success: false,
        error: ERROR_MESSAGES.DATABASE_ERROR,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        statusCode: 500,
      }
  }
}

// Handle Zod validation errors
function handleZodError(error: ZodError): ApiError {
  const formattedErrors = error.errors.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
  }))

  return {
    success: false,
    error: ERROR_MESSAGES.VALIDATION_ERROR,
    details: formattedErrors,
    statusCode: 400,
  }
}

// Main error handler
export function handleError(error: unknown, context?: Record<string, unknown>): NextResponse<ApiError> {
  logError(error, context)

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const apiError = handlePrismaError(error)
    return NextResponse.json(apiError, { status: apiError.statusCode })
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const apiError = handleZodError(error)
    return NextResponse.json(apiError, { status: apiError.statusCode })
  }

  // Handle standard errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        statusCode: 500,
      },
      { status: 500 }
    )
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      success: false,
      error: ERROR_MESSAGES.INTERNAL_ERROR,
      statusCode: 500,
    },
    { status: 500 }
  )
}

// Success response helper
export function successResponse<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data }, { status })
}

// Error response helpers
export function unauthorizedResponse(message = ERROR_MESSAGES.UNAUTHORIZED): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      statusCode: 401,
    },
    { status: 401 }
  )
}

export function forbiddenResponse(message = ERROR_MESSAGES.FORBIDDEN): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      statusCode: 403,
    },
    { status: 403 }
  )
}

export function notFoundResponse(message = ERROR_MESSAGES.NOT_FOUND): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      statusCode: 404,
    },
    { status: 404 }
  )
}

export function badRequestResponse(message = ERROR_MESSAGES.BAD_REQUEST, details?: unknown): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details,
      statusCode: 400,
    },
    { status: 400 }
  )
}

export function rateLimitResponse(message = ERROR_MESSAGES.RATE_LIMIT): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      statusCode: 429,
    },
    { status: 429 }
  )
}

// Async error wrapper for API routes
export function asyncHandler<T = unknown>(
  handler: (request: Request, context?: unknown) => Promise<NextResponse<ApiSuccess<T>>>
) {
  return async (request: Request, context?: unknown): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleError(error, { url: request.url, method: request.method })
    }
  }
}
