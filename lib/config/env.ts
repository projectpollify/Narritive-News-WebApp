import { z } from 'zod'

// Environment variable schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // AI Services
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),

  // Authentication
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Email (optional)
  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.coerce.number().optional(),
  EMAIL_SERVER_USER: z.string().optional(),
  EMAIL_SERVER_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Site Configuration
  SITE_URL: z.string().url().optional(),
  SITE_NAME: z.string().default('Narrative News'),

  // Feature Flags
  ENABLE_AUTOMATION: z.coerce.boolean().default(false),
  AUTOMATION_INTERVAL_HOURS: z.coerce.number().default(6),

  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes

  // Analytics (optional)
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
})

// Validate environment variables
export function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env)
    return { success: true, data: parsed }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
      return {
        success: false,
        error: `Environment variable validation failed:\n${missing.join('\n')}`,
      }
    }
    return {
      success: false,
      error: 'Unknown error validating environment variables',
    }
  }
}

// Get validated environment variables
export function getEnv() {
  const result = validateEnv()
  if (!result.success) {
    throw new Error(result.error)
  }
  return result.data
}

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>

// Check if we're in production
export const isProduction = () => process.env.NODE_ENV === 'production'

// Check if we're in development
export const isDevelopment = () => process.env.NODE_ENV === 'development'

// Check if we're in test
export const isTest = () => process.env.NODE_ENV === 'test'

// Generate NEXTAUTH_SECRET if missing (development only)
export function ensureNextAuthSecret() {
  if (isDevelopment() && !process.env.NEXTAUTH_SECRET) {
    console.warn(
      '\x1b[33m%s\x1b[0m',
      'WARNING: NEXTAUTH_SECRET not set. Using development fallback. Generate a secure secret for production:'
    )
    console.log('  openssl rand -base64 32')
    process.env.NEXTAUTH_SECRET = 'development-secret-change-in-production-min-32-chars'
  }
}

// Initialize environment validation
export function initializeEnv() {
  ensureNextAuthSecret()

  const result = validateEnv()
  if (!result.success) {
    console.error('\x1b[31m%s\x1b[0m', result.error)
    if (isProduction()) {
      process.exit(1)
    }
  } else {
    console.log('\x1b[32m%s\x1b[0m', '✓ Environment variables validated successfully')
  }
}
