type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
}

class Logger {
  private isDevelopment: boolean
  private logLevel: LogLevel

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.logLevel)
  }

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context } = entry
    const prefix = `[${level.toUpperCase()}] ${timestamp}`

    if (this.isDevelopment && context) {
      return `${prefix} ${message}\n${JSON.stringify(context, null, 2)}`
    }

    return context ? `${prefix} ${message} ${JSON.stringify(context)}` : `${prefix} ${message}`
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    }

    const formattedMessage = this.formatMessage(entry)

    switch (level) {
      case 'debug':
        console.debug(formattedMessage)
        break
      case 'info':
        console.log(formattedMessage)
        break
      case 'warn':
        console.warn(formattedMessage)
        break
      case 'error':
        console.error(formattedMessage)
        break
    }

    // In production, you might want to send logs to an external service
    if (!this.isDevelopment) {
      // Send to logging service (e.g., CloudWatch, Datadog, LogRocket)
      this.sendToLoggingService(entry)
    }
  }

  private sendToLoggingService(entry: LogEntry) {
    // Implement external logging service integration here
    // Example: Send to CloudWatch, Datadog, Sentry, etc.
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context)
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context)
  }

  // Convenience methods for common operations
  apiRequest(method: string, url: string, context?: Record<string, unknown>) {
    this.info(`API Request: ${method} ${url}`, context)
  }

  apiResponse(method: string, url: string, status: number, duration: number) {
    this.info(`API Response: ${method} ${url} - ${status}`, { duration: `${duration}ms` })
  }

  apiError(method: string, url: string, error: unknown) {
    this.error(`API Error: ${method} ${url}`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
  }

  dbQuery(operation: string, model: string, duration?: number) {
    this.debug(`DB Query: ${operation} ${model}`, duration ? { duration: `${duration}ms` } : undefined)
  }

  cronJob(jobName: string, status: 'started' | 'completed' | 'failed', context?: Record<string, unknown>) {
    const level = status === 'failed' ? 'error' : 'info'
    this.log(level, `Cron Job ${status}: ${jobName}`, context)
  }

  scraping(source: string, status: 'started' | 'completed' | 'failed', context?: Record<string, unknown>) {
    const level = status === 'failed' ? 'error' : 'info'
    this.log(level, `Scraping ${status}: ${source}`, context)
  }

  aiAnalysis(articleId: string, status: 'started' | 'completed' | 'failed', context?: Record<string, unknown>) {
    const level = status === 'failed' ? 'error' : 'info'
    this.log(level, `AI Analysis ${status}: ${articleId}`, context)
  }
}

// Export singleton instance
export const logger = new Logger()

// Export type for external use
export type { LogLevel, LogEntry }
