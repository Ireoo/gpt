import fs from 'fs'
import path from 'path'
import Vue from 'vue'

let regedit = require('regedit')
regedit.setExternalVBSLocation('resources/regedit/vbs')

const reg = (keys = ['HKCU\\SOFTWARE', 'HKLM\\SOFTWARE']) => {
  // console.log(`keys ->`, keys)
  return new Promise(async resolve => {
    regedit.list(keys, function (err, result) {
      // console.log(`err ->`, err)
      if (err) return resolve([])
      let _keys = []
      for (let key of keys) {
        _keys = _keys.concat(result[key].keys.map(k => `${key}\\${k}`))
      }
      resolve(_keys)
    })
  })
}

const soft = (keys = ['HKCU\\SOFTWARE', 'HKLM\\SOFTWARE']) => {
  // console.log(`keys ->`, keys)
  return new Promise(async resolve => {
    regedit.list(keys, function (err, result) {
      // console.log(`err ->`, err)
      if (err) return resolve([])
      let _keys = []
      for (let key of keys) {
        _keys = _keys.concat(result[key].keys)
      }
      resolve(_keys)
    })
  })
}

const value = (keys = ['HKCU\\SOFTWARE', 'HKLM\\SOFTWARE']) => {
  // console.log(`keys ->`, keys)
  return new Promise(resolve => {
    regedit.list(keys, function (err, result) {
      // console.log(`err ->`, err)
      if (err) return resolve([])
      let values = {}
      for (let key of keys) {
        // values = Object.assign(result[key].values, values)
        for (let k of Object.keys(result[key].values)) {
          // console.log("`${key}-${k}` ->", `${key}-${k}`)
          values[`${key}-${k}`] = result[key].values[k]
        }
      }
      resolve(values)
    })
  })
}

const list = async (keys = []) => {
  let r = await reg(keys)
  // console.log(r)
  let _keys = r
  for (let key of r) {
    _keys = _keys.concat(await list([key]))
  }
  return _keys
}

const listAll = async (key = ['HKLM\\SOFTWARE\\Google']) => {
  let keys = await list(key)
  // console.log(`keys ->`, keys)
  // let values = await value(keys)
  // console.log(`values ->`, values)
  // // console.log(await soft())
  return keys
}

// listAll()

Vue.prototype.$soft = {
  list: reg,
  info: listAll,
  value
}

// Vue.prototype.$list = (startPath) => {
//   let result=[];
//   function finder(_path) {
//     let files=fs.readdirSync(_path);
//     files.forEach((val,index) => {
//       try {
//         let fPath = path.join(_path, val);
//         let stats = fs.statSync(fPath);
//         if (stats.isDirectory()) finder(fPath);
//         if (stats.isFile()) result.push(fPath);
//       } catch (e) {
//         console.log(e)
//       }
//     });
//   }
//   finder(startPath);
//   return result;
// }
