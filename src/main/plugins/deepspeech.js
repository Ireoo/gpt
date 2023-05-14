import DeepSpeech from 'deepspeech'

const modelUrl = 'path/to/deepspeech-0.9.3-models.pbmm'
const scorerUrl = 'path/to/deepspeech-0.9.3-models.scorer'

// 加载DeepSpeech模型
export function init(model_url = modelUrl, scorer_url = scorerUrl) {
  const model = new DeepSpeech.Model(model_url)
  model.enableExternalScorer(scorer_url)
  return model
}

export default init
