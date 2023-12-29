import jwt from 'jsonwebtoken'
import config from 'config'
import asyncHandler from 'express-async-handler'
import User from '../user/user.model'
import { Request, Response, NextFunction } from 'express'
import { CustomError } from '../utils/helpers/errors/customError'
import { Types } from 'mongoose'

const JWT_SECRET = config.get('JWT_SECRET') as string

const auth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { headers, method } = req

  if (method === 'OPTIONS') {
    return next()
  }

  if (headers && headers.authorization) {
    const token = headers.authorization.split(' ')[1]

    if (!token) {
      next(new CustomError('Not authorized', 401))
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { _id: Types.ObjectId }

    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

    if (!user) {
      next(new CustomError('Not authorized', 401))
      return
    }

    req.user = user

    return next()
  } else {
    next(new CustomError('Not authorized', 401))
  }
})

export default auth
