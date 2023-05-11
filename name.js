const fs = require('fs')
const path = require('path')

const package = JSON.parse(fs.readFileSync('./package.json', 'utf8'))

const name = package.build.productName
const ext = process.argv[2]

const build = './build'
const extPath = path.join(build, 'ext.txt')

let exts = []
if (fs.existsSync(extPath)) {
    exts = fs.readFileSync(extPath, 'utf8').split('\r\n')
}

const files = fs.readdirSync(build)

files.forEach(file => {
    let changedName = file.replace(new RegExp(`(${name})`, 'gi'), (...n) => {
        console.log(n)
        if (
            exts.filter(e => new RegExp(`-${e}`, 'gi').test(n[3])).length === 0 &&
            !new RegExp(`-${ext}`, 'gi').test(n[3])
        ) {
            return `${n[1]}-${ext}`
        } else {
            return `${n[1]}`
        }
    })
    console.log(`change "${file}" to "${changedName}"`)
    if (file !== changedName) {
        console.log(`change "${file}" to "${changedName}"`)
        fs.copyFileSync(path.join(build, file), path.join(build, changedName))
        fs.unlinkSync(path.join(build, file))
    }
})

fs.appendFileSync(path.join(build, 'ext.txt'), `${ext}\r\n`)