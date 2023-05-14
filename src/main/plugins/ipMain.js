import { ipcMain } from 'electron'
import deepspeech from './deepspeech'

let model = null

const IpcMain = () => {
  ipcMain.on('init_model', (event, args) => {
    model = deepspeech(args.model, args.scorer)
    event.returnValue = true
  })

  ipcMain.on('model_stt', (event, data) => {
    if (model) {
      model
        .stt(data.input)
        .then(result => {
          event.sender.send('model_stt', { result, inferenceTime: data.inferenceTime })
        })
        .catch(e => {
          event.sender.send('model_stt', { inferenceTime: data.inferenceTime, error: e })
        })
    } else {
      event.sender.send('model_stt', { inferenceTime: data.inferenceTime, error: 'no model!' })
    }
  })
}

export default IpcMain
