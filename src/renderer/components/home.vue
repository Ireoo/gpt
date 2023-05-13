<template>
  <el-container class="main">
    <el-header style="display: flex; align-content: center; align-items: center; justify-content: flex-end">
      <!--      {{ dom }}-->
      <el-input v-model="local">
        <el-button slot="append" icon="el-icon-folder-opened" @click="getLocal(`local`)"></el-button>
      </el-input>
      <!-- <el-button title="Logout" @click="logout" icon="el-icon-user-solid" circle></el-button> -->
    </el-header>
    <el-container>
      <el-aside width="80px">
        <div :style="`height: ${dom.height - 70}px;`" style="overflow-y: auto; overflow-x: hidden">
          <div
            v-for="item in list"
            :key="item.name"
            :class="{ active: item.name === now, item: true }"
            @click="changeSoft(item.name)"
          >
            <el-image :src="item.icon" fit="fill"></el-image>
            {{ item.label }}
          </div>
        </div>
      </el-aside>
      <el-main>
        {{ result }}
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import fs from 'fs'
import os from 'os'
import path from 'path'
import $ from 'jquery'
import * as tf from '@tensorflow/tfjs'
import DeepSpeech from 'deepspeech'
import Poe from 'quora-poe.js'

export default {
  name: 'home',
  data() {
    return {
      model: null,
      recording: false,
      mediaRecorder: null,
      audioContext: null,
      source: null,
      analyser: null,
      canvas: null,
      canvasContext: null,
      animationFrameId: null,
      result: '',
      bot: null
    }
  },
  watch: {
    // 监听mediaRecorder.dataavailable事件
    'mediaRecorder.state'(value) {
      if (value === 'recording') {
        this.mediaRecorder.ondataavailable = event => {
          // 将音频数据转为Float32Array格式
          const audioData = new Float32Array(event.data)
          // 对音频数据进行识别
          this.recognize(audioData)
        }
      }
    }
  },
  computed: {
    version() {
      return fs.readFileSync(path.join(this.root, 'version'))
    },
    config() {
      let config = path.join(os.homedir(), '.gpt')
      if (!fs.existsSync(config)) fs.mkdirSync(config)
      return config
    },
    root() {
      let root = __dirname
      if (!fs.existsSync(path.join(root, 'command'))) root = process.cwd()
      if (!fs.existsSync(path.join(root, 'command'))) root = path.join(__dirname, '../../../../')
      return root
    }
  },
  beforeCreate() {},
  methods: {
    async recognize(audioData) {
      // 对音频进行预处理
      const input = this.preprocess(audioData)

      // 对音频进行识别
      const inferenceTime = Date.now()
      const result = await this.model.stt(input)
      console.log(`Inference time: ${Date.now() - inferenceTime}ms`)
      console.log(`Result: ${result}`)

      // 更新识别结果
      this.result = result
    },
    preprocess(audioData, sampleRate) {
      // 归一化
      const max = Math.max(...audioData)
      const min = Math.min(...audioData)
      audioData = audioData.map(sample => ((sample - min) / (max - min)) * 2 - 1)

      // 降噪
      const noiseGate = 0.01 // 噪声门限
      let noiseLevel = 0
      for (let i = 0; i < audioData.length; i++) {
        const sample = Math.abs(audioData[i])
        noiseLevel += sample
        if (sample < noiseGate) {
          audioData[i] = 0
        }
      }
      noiseLevel /= audioData.length
      audioData = audioData.filter(sample => sample !== 0)

      // 转换为Float32Array格式
      const buffer = new ArrayBuffer(audioData.length * 2)
      const view = new DataView(buffer)
      audioData.forEach((sample, index) => {
        view.setInt16(index * 2, sample * 32767, true)
      })
      return new Float32Array(buffer)
    }
  },
  async mounted() {
    const modelUrl = 'path/to/deepspeech-0.9.3-models.pbmm'
    const scorerUrl = 'path/to/deepspeech-0.9.3-models.scorer'

    // 加载DeepSpeech模型
    this.model = new DeepSpeech.Model(modelUrl)
    this.model.enableExternalScorer(scorerUrl)

    // poe
    this.bot = new Poe()
    await bot.start()
    // let answer = await bot.ask('Hello!', 'gpt-4')

    // 获取音频流
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(stream => {
        // 创建MediaRecorder实例
        this.mediaRecorder = new MediaRecorder(stream)
        // 创建AudioContext实例
        this.audioContext = new AudioContext()
        // 创建MediaStreamAudioSourceNode实例
        this.sourceNode = this.audioContext.createMediaStreamSource(stream)
        // 创建AnalyserNode实例
        this.analyserNode = this.audioContext.createAnalyser()
        // 连接节点
        this.sourceNode.connect(this.analyserNode)
        this.analyserNode.connect(this.audioContext.destination)
        // 开始录音
        this.mediaRecorder.start()
      })
      .catch(error => {
        console.error('Failed to get user media:', error)
      })
  }
}
</script>

<style scoped>
.main {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.el-header {
  background: #00bdbd;
}

.el-aside {
  text-align: center;
  font-size: 12px;
  color: #666;
  background: #eeeeee;
  padding-top: 5px;
  border-right: 1px #fff solid;
}

.el-aside div.item {
  margin: 0 5px;
  padding: 5px 0;
  border-radius: 5px;
  cursor: pointer;
  width: 69px;
}

.el-aside div.item.active {
  background: RGBA(0, 0, 0, 0.1);
}

.el-aside .el-avatar,
.el-aside .el-image {
  width: 40px;
  display: block;
  margin: auto;
}

.el-aside .el-button {
  padding: 0;
  display: block;
  margin: auto;
}

.el-aside .links {
  padding: 5px 10px 10px 10px;
  color: #333;
}

.el-aside h1 {
  text-align: left;
  margin-bottom: 30px;
  font-size: 24px;
}

.el-aside ul {
  text-align: left;
  font-size: 14px;
  list-style: none;
}

.el-aside ul li {
  margin-bottom: 5px;
  flex-flow: wrap;
  display: flex;
}

.el-aside ul li .el-button {
  margin: unset;
  color: #333;
}

.el-aside ul li .el-button img {
  display: inline-block;
  width: 20px;
  /*vertical-align:middle;*/
}

.el-aside ul li .el-button:hover {
  color: #4898f8;
}

div.software {
  display: flex;
  flex-flow: wrap;
  justify-content: space-between;
  flex-wrap: nowrap;
  align-items: center;
  font-size: 12px;
}

h1.software {
  border-bottom: 3px #ccc solid;
  padding-bottom: 20px;
  margin-bottom: 30px;
}

div.software ul {
  list-style: none;
}
</style>
<style>
.el-aside ul li .el-button i {
  color: RGB(255, 193, 7);
}
</style>

<style>
::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-track {
  background: rgba(179, 177, 177, 0);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb {
  background: rgba(136, 136, 136, 0.2);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(103, 103, 103, 0.3);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:active {
  background: rgba(129, 129, 129, 0.3);
  border-radius: 5px;
}

/*::-webkit-scrollbar {!*滚动条整体样式*!*/
/*  width: 5px;     !*高宽分别对应横竖滚动条的尺寸*!*/
/*  height: 1px;*/
/*}*/
/*::-webkit-scrollbar-thumb {!*滚动条里面小方块*!*/
/*  width: 1px;*/
/*  border-radius: 5px;*/
/*  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.09);*/
/*  background: rgba(83, 83, 83, 0.17);*/
/*}*/
/*::-webkit-scrollbar-track {!*滚动条里面轨道*!*/
/*  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.07);*/
/*  border-radius: 5px;*/
/*  background: #EDEDED;*/
/*}*/
</style>
