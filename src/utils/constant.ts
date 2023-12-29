import * as Yup from 'yup'

export const YUP_OPTIONS: Yup.ValidateOptions<Yup.AnyObject> | undefined = {
  stripUnknown: true,
  abortEarly: false,
}
