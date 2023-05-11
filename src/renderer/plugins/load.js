import Vue from 'vue'

const fs = require('fs')
const path = require('path')

const request = require('request').defaults({ strictSSL: false })
const progress = require('progress-stream')

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

Vue.prototype.$down = (video, cb) => {
  try {
    console.log(video)
    if (video.local) {
      let localfile = path.join(video.local, path.basename(video.path))
      console.log(`local file ->`, localfile)
      if (video.local && fs.existsSync(video.local) && fs.existsSync(localfile)) {
        // video.path = localfile
        fs.copyFileSync(localfile, video.path)
        return cb(null, 'done')
      }
    }
    // if (fs.existsSync(video.path) && !/\.json/gi.test(video.path)) return cb(null, 'done')
    let file = fs.createWriteStream(video.path, {
      flags: 'w',
      defaultEncoding: 'utf8',
      fd: null,
      mode: 0o666,
      autoClose: true
    })

    file.on('close', () => {
      cb(null, 'done')
    })

    file.on('finish', () => {
      // cb(null, 'done')
    })

    file.on('error', err => {
      cb(err, null)
    })

    file.on('open', () => {
      let options = {
        url: video.url,
        encoding: null //当请求的是二进制文件时，一定要设置
      }

      request
        .get(options)
        .on('response', function (response) {
          //显示进度条
          console.log(response)
          let proStream = progress({
            length: response.headers['content-length'],
            time: 5000 /* ms */
          })

          proStream
            .on('progress', function (progress) {
              let percentage = Math.round(progress.percentage)
              cb(null, percentage)
            })
            .on('error', function (err) {
              cb(err, null)
            })
          request.get(options).pipe(proStream).pipe(file) //先pipe到proStream再pipe到文件的写入流中
        })
        .on('error', function (err) {
          cb(err, null)
        })
    })
  } catch (err) {
    cb(err, null)
  }
}
