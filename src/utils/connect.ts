import mongoose from 'mongoose'
import config from 'config'

async function connect() {
  const dbUri = config.get<string>('DB_URI')

  try {
    await mongoose.connect(dbUri, {
      autoIndex: true,
    })
    console.log('DB connected')
  } catch (error) {
    console.error('Could not connect to db')
    process.exit(1)
  }
}

export default connect
