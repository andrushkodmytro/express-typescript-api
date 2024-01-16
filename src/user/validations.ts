import * as Yup from 'yup'

export const userRegistrationScheme = Yup.object().shape({
  firstName: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('First name is required'),
  lastName: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  // img: Yup.string()
  //   .min(2, 'User image is required')
  //   .max(500, 'Too Long!')
  //   .required('Required'),
  password: Yup.string().min(8, 'Password is required').max(50, 'Too Long!').required('Password is required'),
})

export const userLoginScheme = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(8, 'Password is required').max(50, 'Too Long!').required('Password is required'),
  remember: Yup.boolean(),
})

export const userUpdateScheme = Yup.object()
  .shape({
    password: Yup.string().min(8, 'Password is required').max(50, 'Too Long!'),
    firstName: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!'),
    lastName: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!'),
  })
  .test('x', 'One fields is required', (value, clx) => {
    if (Object.keys(clx.schema.fields).some((item) => Object.prototype.hasOwnProperty.call(value, item))) {
      return true
    }
    return false
  })

export const userUpdateByAdminScheme = Yup.object().shape({
  firstName: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('First name is required'),
  lastName: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Last name is required'),
})
