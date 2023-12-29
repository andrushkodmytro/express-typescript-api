import { NextFunction, Request, Response } from 'express'
import { CustomError, TError, ValidationError } from '../utils/helpers/errors/customError'
import * as Yup from 'yup'
import { Error as MongooseError } from 'mongoose'

interface MongoServerError {
  code: number
  keyValue: { [key: string]: string }
}

const devErrors = (res: Response, error: Error) => {
  if (error instanceof CustomError) {
    return res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
      stackTrace: error.stack,
      error: error,
    })
  } else if (error instanceof Yup.ValidationError) {
    const errors = normalizeError(error)

    return res.status(422).json({
      status: 'failed',
      message: error.message,
      stackTrace: error.stack,
      error: error,
      errors: errors,
    })
  } else {
    return res.status(500).json({
      status: 500,
      message: error.message,
      stackTrace: error.stack,
      error: error,
    })
  }
}

const castErrorHandler = (err: MongooseError.CastError) => {
  const msg = `Invalid value for ${err.path}: ${err.value}!`
  return new CustomError(msg, 400)
}

const duplicateKeyErrorHandler = (err: Error & MongoServerError) => {
  const name = Object.keys(err.keyValue).join(', ')
  const msg = `There is already a movie with name \`${name}\`. Please use another name!`

  return new CustomError(msg, 400)
}

const validationErrorHandler = (err: MongooseError.ValidationError) => {
  const msg = `Invalid input data: `

  const errors: TError = {}

  Object.values(err.errors as { [path: string]: MongooseError.ValidatorError }).forEach((item) => {
    item.path
    errors[item.path] = item?.properties.message
  })

  return new ValidationError(msg, errors, 400)
}

const yupValidationErrorHandler = (error: Yup.ValidationError) => {
  const msg = `Invalid input data: `
  const errors = normalizeError(error)

  return new ValidationError(msg, errors, 400)
}

const prodErrors = (res: Response, error: Error) => {
  if (error instanceof CustomError && error.isOperational) {
    res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
    })
  } else if (error instanceof ValidationError && error.isOperational) {
    res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
      errors: error.errors,
    })
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong! Please try again later.',
    })
  }
}

function normalizeError(error: Yup.ValidationError) {
  const errors: TError = {}

  error.inner.forEach((err) => {
    const key = err?.path || 'all'
    errors[key] = err.errors[0]
  })

  return errors
}

export function appErrorHandler(error: Error, req: Request, res: Response, _next: NextFunction) {
  if (process.env.NODE_ENV === 'development') {
    devErrors(res, error)
  } else {
    if (error instanceof MongooseError.CastError) error = castErrorHandler(error)
    if (error.name === 'MongoServerError') error = duplicateKeyErrorHandler(error as Error & MongoServerError)
    if (error instanceof MongooseError.ValidationError) error = validationErrorHandler(error)
    if (error instanceof Yup.ValidationError) error = yupValidationErrorHandler(error)

    prodErrors(res, error)
  }
}
