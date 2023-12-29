export class CustomError extends Error {
  status: string
  isOperational: boolean
  // temporary
  code?: number

  constructor(
    public message: string,
    public statusCode: number
  ) {
    super(message)
    this.statusCode = statusCode || 500
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error'

    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export type TError = { [key: string]: string }

export class ValidationError extends Error {
  status: string
  isOperational: boolean

  constructor(
    public message: string,
    public errors: TError,
    public statusCode: number
  ) {
    super(message)
    this.statusCode = statusCode || 500
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error'

    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}
