import mongoose from 'mongoose'
import supertest from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { createServer } from '../utils/createServer'
import User from './user.model'
import { IUser } from './user.type'

const app = createServer()

const registrationUserPayload = {
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'user@gmail.com',
  password: '12345678',
}

const loginUserPayload = {
  email: registrationUserPayload.email,
  password: registrationUserPayload.password,
}

const updateUserPayload = {
  firstName: 'updatedFirstName',
  lastName: 'updateLastName',
  email: 'update_user@gmail.com',
  password: '12345678',
}

const adminPayload = {
  firstName: 'firstAdminName',
  lastName: 'lastAdminName',
  email: 'admin@gmail.com',
  password: 'abc12345',
}

type UserRegisterType = Pick<IUser, 'email' | 'password' | 'firstName' | 'lastName'>
type UserLogInType = Pick<IUser, 'email' | 'password'>

const openDBConnection = async () => {
  const mongoServer = await MongoMemoryServer.create({ binary: { version: '4.2.24' } })

  await mongoose.connect(mongoServer.getUri())
}

const closeDBConnection = async () => {
  await mongoose.disconnect()
  await mongoose.connection.close()
}

const registerUserReq = async (payload: UserRegisterType) => {
  return await supertest(app).post(`/api/users/register`).send(payload)
}

const logInUserReq = async (payload: UserLogInType) => {
  return await supertest(app).post(`/api/users/login`).send(payload)
}

const registerAdmin = async (payload: UserRegisterType) => {
  await registerUserReq(payload)

  return await User.findOneAndUpdate(
    { email: adminPayload.email },
    { roles: ['user', 'admin'] },
    { runValidators: true }
  )
}

describe('User module', () => {
  describe('Register new user block', () => {
    beforeAll(async () => {
      await openDBConnection()
    })

    afterAll(async () => {
      await closeDBConnection()
    })

    it('Register new user', async () => {
      const { status, body } = await registerUserReq(registrationUserPayload)

      const { password: passwordIgnored, ...createdUser } = registrationUserPayload

      expect(status).toBe(201)
      expect(body.data).toMatchObject(createdUser)
    })

    it('User with taken email already exist', async () => {
      await registerUserReq(registrationUserPayload)

      const { status } = await registerUserReq(registrationUserPayload)

      expect(status).toBe(409)
    })

    it('Register new user with incorrect data', async () => {
      const { status, body } = await registerUserReq({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
      })

      expect(status).toBe(400)
      expect(Object.keys(body.errors).length).toBe(4)
    })
  })

  describe('Login user block', () => {
    beforeAll(async () => {
      await openDBConnection()
      await registerUserReq(registrationUserPayload)
    })

    afterAll(async () => {
      await closeDBConnection()
    })

    it('Login user', async () => {
      const { status, body } = await logInUserReq(loginUserPayload)

      const { password: passwordIgnored, ...createdUser } = registrationUserPayload

      expect(status).toBe(200)
      expect(body.user).toMatchObject(createdUser)
      // TODO test token an expired date
    })

    it('Login user with incorrect email', async () => {
      const { status, body } = await logInUserReq({ ...loginUserPayload, email: 'wrong@gmail.com' })

      expect(status).toBe(401)
      expect(body.message).toBe('Unable to login')
    })

    it('Login user with incorrect password', async () => {
      const { status, body } = await logInUserReq({ ...loginUserPayload, password: '87654321' })

      expect(status).toBe(401)
      expect(body.message).toBe('Unable to login')
    })
  })

  describe('Update user block', () => {
    let token = ''

    beforeAll(async () => {
      await openDBConnection()

      await registerUserReq(registrationUserPayload)
      const { body } = await logInUserReq(loginUserPayload)
      token = body.token
    })

    afterAll(async () => {
      await closeDBConnection()
    })

    it('Update user', async () => {
      const { password: passwordIgnored, email: emailIgnored, ...updatedUser } = updateUserPayload

      const { status, body } = await supertest(app)
        .patch(`/api/users/me`)
        .set('Authorization', 'bearer ' + token)
        .send(updatedUser)

      expect(status).toBe(200)
      expect(body.user).toMatchObject(updatedUser)
    })

    it('Update user email returns error', async () => {
      const { email } = updateUserPayload

      const { status } = await supertest(app)
        .patch(`/api/users/me`)
        .set('Authorization', 'bearer ' + token)
        .send(email)

      expect(status).toBe(400)
    })
  })

  describe('Update user by admin block', () => {
    let token = ''
    let userId = ''

    beforeAll(async () => {
      await openDBConnection()

      await registerUserReq(registrationUserPayload)
      const user = await User.findOne({ email: registrationUserPayload.email })
      if (user) {
        userId = user._id.toString()
      }

      await registerAdmin(adminPayload)

      const { password, email } = adminPayload

      const { body } = await logInUserReq({ password, email })
      token = body.token
    })

    afterAll(async () => {
      await closeDBConnection()
    })

    it('Update user by admin', async () => {
      const { password: passwordIgnored, email: emailIgnored, ...updatedUser } = updateUserPayload

      const { status, body } = await supertest(app)
        .patch(`/api/users/${userId}`)
        .set('Authorization', 'bearer ' + token)
        .send(updatedUser)

      expect(status).toBe(200)
      expect(body.user).toMatchObject(updatedUser)
    })

    it('Update user email by admin returns error', async () => {
      const { email } = updateUserPayload

      const { status } = await supertest(app)
        .patch(`/api/users/${userId}`)
        .set('Authorization', 'bearer ' + token)
        .send({ email })

      expect(status).toBe(400)
    })
  })

  describe('Get user data block', () => {
    let token = ''
    let userId = ''

    beforeAll(async () => {
      await openDBConnection()
      await registerUserReq(registrationUserPayload)

      const user = await User.findOne({ email: registrationUserPayload.email })
      if (user) {
        userId = user._id.toString()
      }

      const { body } = await logInUserReq(loginUserPayload)
      token = body.token
    })

    afterAll(async () => {
      await closeDBConnection()
    })

    it('Get user data', async () => {
      const { password: passwordIgnored, ...createdUser } = registrationUserPayload

      const { status, body } = await supertest(app)
        .get(`/api/users/me`)
        .set('Authorization', 'bearer ' + token)
        .send()

      expect(status).toBe(200)
      expect(body.user._id.toString()).toBe(userId)
      expect(body.user).toMatchObject(createdUser)
    })

    it('Get user data without token', async () => {
      const { status, body } = await supertest(app).get(`/api/users/me`).send()

      expect(status).toBe(401)
      expect(body.message).toBe('Not authorized')
    })
  })
})
