const fs = require('fs')

const writer = fs.createWriteStream('./a.txt', {
  flags: 'w',
  defaultEncoding: 'utf8',
  fd: null,
  mode: 0o666,
  autoClose: true
})

//写入数据到流
writer.write('，适合去郊游,', 'utf8')
//再次向文件写入数据，会从当前位置开始写入
writer.write('咱们出发把！', 'utf8')

//关闭写入流，表明已没有数据要被写入可写流
writer.end()

writer.on('open', () => {
  console.log('文件已被打开', writer.pending)
})
writer.on('ready', () => {
  console.log('文件已为写入准备好', writer.pending)
})
writer.on('finish', () => {
  console.log('文件已为写入完成', writer.pending)
})
writer.on('close', () => {
  console.log('文件已被关闭')
  console.log('总共写入了%d个字节', writer.bytesWritten)
  console.log('写入的文件路径是' + writer.path)
})
