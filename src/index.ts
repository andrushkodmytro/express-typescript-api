import config from 'config'
import { createServer } from './utils/createServer'
import connect from './utils/connect'

const PORT = config.get('PORT')
const app = createServer()

app.listen(process.env.PORT || PORT, async () => {
  console.log('Server started')

  await connect()
})
