import { NextFunction, Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import User from './user.model'
import { userLoginScheme, userRegistrationScheme, userUpdateByAdminScheme, userUpdateScheme } from './validations'
import { YUP_OPTIONS } from '../utils/constant'
import { CustomError } from '../utils/helpers/errors/customError'

const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, firstName, lastName } = await userRegistrationScheme.validate(req.body, YUP_OPTIONS)

  const newUser = await User.findOne({ email }).lean().exec()

  if (newUser) {
    next(new CustomError('This user is already exist', 409))
    return
  }

  const user = new User({
    email,
    password,
    firstName,
    lastName,
    roles: ['user'],
  })

  const savedUser = await user.save()

  res.status(201).json({ message: 'User created successfully', data: savedUser })
})

const loginUser = asyncHandler(async (req, res, _next) => {
  const { email, password, remember } = await userLoginScheme.validate(req.body, YUP_OPTIONS)

  const user = await User.findByCredentials(email, password)

  const { token, expiresIn } = await user.generateAuthToken(remember)

  res.send({ user, token, expiresIn })
})

const logoutUser = asyncHandler(async (req, res, next) => {
  const { headers, user } = req

  if (headers && headers.authorization) {
    const removedToken = headers.authorization.split(' ')[1]

    user.tokens = user.tokens.filter((token) => token.token !== removedToken)
    await user.save()

    res.send({ status: 'success' })
    return
  }

  next(new CustomError('Not authorized', 401))
})

const updateUser = asyncHandler(async (req, res) => {
  const validData = await userUpdateScheme.validate(req.body, YUP_OPTIONS)

  req.user = Object.assign(req.user, validData)

  const updatedUser = await req.user.save()

  res.send({ status: 'success', user: updatedUser })
})

const updateUserByAdmin = asyncHandler(async (req, res, next) => {
  const validData = await userUpdateByAdminScheme.validate(req.body, YUP_OPTIONS)

  if (!req.user.roles.includes('admin')) {
    next(new CustomError('Not allowed', 403))
    return
  }

  let user = await User.findById(req.params.id)

  if (!user) {
    next(new CustomError('User not found', 404))
    return
  }

  user = Object.assign(user, validData)

  const updatedUser = await user.save()

  res.send({ message: `User updated`, user: updatedUser })
})

const getUser = asyncHandler(async (req, res) => {
  const { user } = req

  res.json({ user })
})

export default { registerUser, loginUser, logoutUser, getUser, updateUser, updateUserByAdmin }
