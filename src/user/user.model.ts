import { Schema, model, Types } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import config from 'config'
import { CustomError } from '../utils/helpers/errors/customError'
import { IUser, IUserMethods, UserModel } from './user.type'

const JWT_SECRET = config.get('JWT_SECRET') as string

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: { type: 'String', required: true, unique: true },
    password: { type: 'String', required: [true, 'Password is required'] },
    firstName: { type: 'String', required: [true, 'First name is required'] },
    lastName: { type: 'String', required: true },
    roles: [{ type: String, enum: ['user', 'admin'] }],
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    createdAt: Date,
    updatedAt: Date,
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updatedAt',
    },
  }
)

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8)
  }

  next()
})

userSchema.methods.toJSON = function () {
  const userObject = this.toObject()
  delete userObject.password
  delete userObject.tokens

  return userObject
}

userSchema.methods.generateAuthToken = async function (remember) {
  const delta = remember ? 60 * 60 * 24 * 7 : 60 * 60

  const expiresIn = Math.floor(Date.now() / 1000) + delta
  const token = jwt.sign(
    {
      _id: this._id.toString(),
    },
    JWT_SECRET,
    { expiresIn }
  )

  this.tokens = this.tokens.concat({ token, _id: new Types.ObjectId() })
  await this.save()

  return { token, expiresIn }
}

userSchema.statics.findByCredentials = async (email: string, password: string) => {
  const user = await User.findOne({ email })

  if (!user) {
    throw new CustomError('Unable to login', 401)
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new CustomError('Unable to login', 401)
  }

  return user
}

const User = model<IUser, UserModel>('User', userSchema)

export default User
