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
        <!--        <el-scrollbar ref='myScrollbar' :native='false' :style="`height: ${dom.height - 70}px;`" :wrapStyle="[{ 'overflow-x': 'hidden' }]">-->
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
        <!--        </el-scrollbar>-->
      </el-aside>
      <el-aside width="200px" style="position: relative">
        <div class="links">
          <h1>Links</h1>
          <ul>
            <li v-for="item in icons" :key="item.name">
              <!--              <img :src='item.icon' />-->
              <el-button type="text" :icon="item.icon" @click="$electron.shell.openExternal(item.href)">
                {{ item.name }}
              </el-button>
            </li>
          </ul>
        </div>
        <div style="position: absolute; bottom: 5px; left: 0; right: 0">Ver: {{ version }}</div>
      </el-aside>
      <el-main>
        <h1 class="software">Download</h1>
        <div v-if="software">
          <div class="software" style="margin-bottom: 50px">
            <div>
              <el-image :src="thisIcon" fit="fit" style="width: 40px"></el-image>
            </div>
            <div v-if="!loading && software.version.length > 0">
              <ul>
                <li v-for="v of software.version" :key="v">Local version: {{ v }}</li>
              </ul>
            </div>
            <div v-if="!loading && software.version.length === 0">Local Missing</div>
            <div>
              Remote version:
              {{
                software[platform].constructor === Array ? software[platform][0].version : software[platform].version
              }}
            </div>
            <div>
              <el-progress
                v-if="software.bar >= 0"
                style="width: 200px"
                :text-inside="false"
                :stroke-width="10"
                :percentage="software.bar"
              ></el-progress>
              <el-button
                v-if="software.bar === -1 && software.version.length === 0"
                type="primary"
                @click="download(software)"
                >DOWNLOAD</el-button
              >
              <el-button
                v-if="
                  software.bar === -1 &&
                  software.version.length > 0 &&
                  software.version.filter(v => v === software[platform].version).length === 0
                "
                type="primary"
                @click="download(software)"
                >UPGRADE</el-button
              >
              <el-button
                v-if="
                  software.bar === -1 &&
                  software.version.length > 0 &&
                  software.version.filter(v => v === software[platform].version).length >= 1
                "
                type="success"
                disabled
                >INSTALLED</el-button
              >
            </div>
          </div>
          <h1 v-if="software.plugins.length > 0">Plugins</h1>
          <div
            class="software"
            v-if="software.plugins.length > 0"
            v-for="p of software.plugins"
            style="margin-top: 10px"
          >
            <div>{{ p.name }}</div>
            <div>
              <el-progress
                v-if="p.bar >= 0"
                style="width: 200px"
                :text-inside="false"
                :stroke-width="10"
                :percentage="p.bar"
              ></el-progress>
              <el-button
                v-if="p.bar === -1 && !pluginIsEx(p, software[platform].path)"
                type="primary"
                @click="downloadPlugins(p, software[platform].path)"
                >DOWNLOAD</el-button
              >
              <el-button
                v-if="p.bar === -1 && pluginIsEx(p, software[platform].path)"
                disabled
                type="primary"
                @click="downloadPlugins(p, software[platform].path)"
                >Downloaded</el-button
              >
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import fs from 'fs'
import os from 'os'
import path from 'path'
import unzip from 'unzipper'
import $ from 'jquery'

const plist = require('plist')
let regedit = require('regedit')
regedit.setExternalVBSLocation('resources/regedit/vbs')

const compressing = require('compressing')

export default {
  name: 'home',
  data() {
    return {
      local: '',
      dom: {
        height: $(window).height(),
        width: $(window).width()
      },
      list: [
        {
          name: 'iCreator',
          label: 'iCreator',
          icon: require('@/assets/image/iCreator.png'),
          win32: {
            version: '0.0.0',
            url: 'https://github.com/integemjack/Integem_Creator/releases/download/v1.3.485/Integem.iCreator.Setup.1.3.485_tools.exe'
          },
          darwin: {
            version: '0.0.0',
            url: 'https://apps.apple.com/us/app/icreator/id1552650285',
            isUrl: true
          },
          linux: {
            version: '0.0.0',
            url: ''
          },
          bar: -1
        },
        {
          name: 'iPlayer',
          label: 'iPlayer',
          icon: require('@/assets/image/iPlayer.png'),
          win32: {
            version: '0.0.33',
            url: 'https://creator.integem.com/wp-content/soft/iPlayer.exe'
          },
          darwin: {
            version: '0.0.0',
            url: 'https://creator.integem.com/wp-content/soft/iPlayer.dmg'
          },
          linux: {
            hide: true,
            version: '0.0.0',
            url: ''
          },
          bar: -1
        },
        {
          name: 'iCamera',
          label: 'iCamera',
          icon: require('@/assets/image/iPlayer.png'),
          win32: {
            version: '0.0.33',
            url: 'https://creator.integem.com/wp-content/soft/IntegemCam_Installer_v1.0.1.14.msi'
          },
          darwin: {
            hide: true,
            version: '0.0.0',
            url: ''
          },
          linux: {
            hide: true,
            version: '0.0.0',
            url: ''
          },
          displayName: 'IntegemCamera',
          bar: -1
        },
        {
          name: 'Python',
          label: 'Python',
          icon: require('@/assets/image/Python.png'),
          win32: {
            version: '0.0.0',
            url: 'https://www.python.org/ftp/python/3.10.2/python-3.10.2-amd64.exe'
          },
          darwin: {
            version: '0.0.0',
            url: ''
          },
          linux: {
            version: '0.0.0',
            url: ''
          },
          bar: -1
        },
        {
          name: 'code',
          label: 'Visual Studio Code',
          icon: require('@/assets/image/vscode.png'),
          win32: {
            version: '1.65.2',
            url: 'https://az764295.vo.msecnd.net/stable/c722ca6c7eed3d7987c0d5c3df5c45f6b15e77d1/VSCodeUserSetup-x64-1.65.2.exe'
          },
          darwin: {
            version: '0.0.0',
            url: ''
          },
          linux: {
            version: '0.0.0',
            url: ''
          },
          bar: -1,
          displayName: 'Visual Studio Code'
        },
        {
          name: 'Roblox',
          label: 'Roblox Studio',
          icon: require('@/assets/image/Roblox.png'),
          win32: {
            version: '0.0.0',
            url: 'https://setup.rbxcdn.com/RobloxStudioLauncherBeta.exe'
          },
          darwin: {
            version: '0.0.0',
            url: ''
          },
          linux: {
            version: '0.0.0',
            url: ''
          },
          displayName: 'roblox',
          bar: -1
        },
        {
          name: 'Adobe',
          label: 'Adobe',
          icon: require('@/assets/image/Adobe.png'),
          win32: {
            version: '0.0.0',
            url: 'https://creator.integem.com/wp-content/soft/Creative_Cloud_Set-Up.exe'
          },
          darwin: {
            version: '0.0.0',
            url: ''
          },
          linux: {
            version: '0.0.0',
            url: ''
          },
          bar: -1
        },
        {
          name: 'Blender',
          label: 'Blender',
          icon: require('@/assets/image/Blender.png'),
          win32: {
            version: '0.0.0',
            url: 'https://mirror.clarkson.edu/blender/release/Blender3.0/blender-3.0.1-windows-x64.msi'
          },
          darwin: {
            version: '0.0.0',
            url: ''
          },
          linux: {
            version: '0.0.0',
            url: ''
          },
          displayName: 'blender',
          bar: -1
        },
        {
          name: 'Snaplense',
          label: 'Snaplense',
          icon: require('@/assets/image/Snaplense.png'),
          win32: {
            version: '0.0.0',
            url: 'https://storage.googleapis.com/prod-studio3d-binaries/binaries/61329159-c2c9-40f3-ae25-d6650245b81e/Lens_Studio_v4.13.exe?GoogleAccessId=968296265399-compute@developer.gserviceaccount.com&Expires=1644892294&Signature=WqgbctWWPulBTZWMmWfw4nkV%2FSMhmPJPU%2Fn3tgVZcMvM6yT3h8MTCVeOtEwfoX3YKe5sQzQ09fNt30d%2B8e%2BqgypiftiL0NcH0kgrTN2PhVEXDzx52eTvJg%2BAYwAioj2etCIy%2FxKvRET6u9ipoHIwq520ma9FOqB%2FziZU%2FILLXlDbM8PLdqETj01klgUJuJOZX%2F3vFhCY0Z37sgfnAGrlh2RFMu%2BwdCpCBsC5JdwkQwYGPCSAac4CJrXFYabzVIP78MV2mp6YCoQelVAN5tVPMWbiSWb47HhbGTZS6v1DCrE10UUQ9sfJVR8dt0tMu%2FWevnQ9mJxmpizNAP%2FKwvstrw%3D%3D'
          },
          darwin: {
            version: '0.0.0',
            url: ''
          },
          linux: {
            version: '0.0.0',
            url: ''
          },
          displayName: 'lens studio',
          bar: -1
        },
        {
          name: 'human',
          label: 'iHuman',
          icon: require('@/assets/image/ihuman.png'),
          win32: {
            version: '1.0.0',
            url: 'https://creator.integem.com/wp-content/soft/makehuman.zip',
            path: 'require("path").join(require("os").homedir(), "Documents/makehuman-community")',
            shortcut: 'makehuman.vbs',
            extend:
              'const path = require("path"); const os = require("os"); require("child_process").execSync(`"${path.join("{root}", "command/makehuman.vbs")}" "{self}"`)'
          },
          darwin: {
            version: '1.0.0',
            url: 'https://creator.integem.com/wp-content/soft/MakeHuman.app.zip',
            path: 'require("path").join(require("os").homedir(), "Documents/human")',
            extend: ''
          },
          linux: {
            version: '0.0.0',
            url: '',
            path: 'require("path").join(require("os").homedir(), "Documents/human")',
            extend: ''
          },
          plugins: [
            {
              name: 'Clothes1',
              url: 'https://creator.integem.com/wp-content/soft/human/Clothes1.zip',
              path: {
                darwin: 'require("path").join("{self}", "makehuman/data/clothes")',
                win32: 'require("path").join("{self}", "makehuman/data/clothes")'
              },
              bar: -1
            },
            {
              name: 'Clothes2',
              url: 'https://creator.integem.com/wp-content/soft/human/clothes2.zip',
              path: {
                darwin: 'require("path").join("{self}", "makehuman/data/clothes")',
                win32: 'require("path").join("{self}", "makehuman/data/clothes")'
              },
              bar: -1
            },
            {
              name: 'Clothes3',
              url: 'https://creator.integem.com/wp-content/soft/human/Clothes3.zip',
              path: {
                darwin: 'require("path").join("{self}", "makehuman/data/clothes")',
                win32: 'require("path").join("{self}", "makehuman/data/clothes")'
              },
              bar: -1
            }
          ],
          displayName: 'iHuman',
          bar: -1
        },
        {
          name: 'visionKitServer',
          label: 'visionKit Server',
          icon: require('@/assets/image/vision.png'),
          win32: {
            version: '1.0.0',
            url: 'https://creator.integem.com/wp-content/soft/visionKitServer.zip',
            path: 'require("path").join(require("os").homedir(), "Documents/visionKitServer")',
            shortcut: 'visikitserver.vbs',
            extend:
              'const path = require("path"); const os = require("os"); require("child_process").execSync(`"${path.join("{root}", "command/visikitserver.vbs")}" "{self}"`)'
          },
          darwin: {
            version: '1.0.0',
            url: 'https://creator.integem.com/wp-content/soft/visionKitServer.zip',
            path: 'require("path").join(require("os").homedir(), "Documents/visionKitServer")',
            extend: ''
          },
          linux: {
            version: '1.0.0',
            url: 'https://creator.integem.com/wp-content/soft/visionKitServer.zip',
            path: 'require("path").join(require("os").homedir(), "Documents/visionKitServer")',
            extend: ''
          },
          plugins: [],
          displayName: 'visionKitServer',
          bar: -1
        },
        {
          name: 'vision',
          label: 'VisionKit Connect',
          icon: require('@/assets/image/vision.png'),
          win32: {
            version: '1.0.14',
            url: 'https://github.com/integemjack/vision-connect/releases/download/v1.0.14/visionKit.connect.Setup.1.0.14.exe'
          },
          darwin: {
            version: '1.0.14',
            url: 'https://github.com/integemjack/vision-connect/releases/download/v1.0.14/visionKit.connect-1.0.14.dmg'
          },
          linux: {
            version: '1.0.14',
            url: 'https://github.com/integemjack/vision-connect/releases/download/v1.0.14/vision-connect_1.0.14_amd64.deb'
          },
          displayName: 'vision-connect',
          bar: -1
        },
        {
          name: 'Thonny',
          label: 'Thonny',
          icon: require('@/assets/image/thonny.png'),
          win32: {
            version: '4.0.2',
            url: 'https://github.com/thonny/thonny/releases/download/v4.0.2/thonny-4.0.2.exe'
          },
          darwin: {
            version: '4.0.2',
            url: 'https://github.com/thonny/thonny/releases/download/v4.0.2/thonny-4.0.2.pkg'
          },
          linux: {
            version: '4.0.2',
            command: 'pip3 install thonny'
          },
          displayName: 'thonny',
          bar: -1
        }
      ],
      now: 'iCreator',
      icons: [
        {
          name: 'Creator Website',
          png: require('@/assets/image/icon/star.png'),
          icon: 'el-icon-star-on',
          href: 'https://creator.integem.com'
        },
        {
          name: 'iDesigner',
          png: require('@/assets/image/icon/id.png'),
          icon: 'el-icon-c-scale-to-original',
          href: 'https://idesigner.integem.com'
        },
        {
          name: 'Text Bubble speech',
          png: require('@/assets/image/icon/dialogue.png'),
          icon: 'el-icon-chat-line-square',
          href: 'https://pixelspeechbubble.com'
        },
        {
          name: 'Voiceover',
          png: require('@/assets/image/icon/voice-recorder.png'),
          icon: 'el-icon-microphone',
          href: ''
        },
        {
          name: 'Photopea',
          png: require('@/assets/image/icon/photopea.png'),
          icon: 'el-icon-picture',
          href: 'https://www.photopea.com'
        }
      ],
      software: null,
      loading: false,
      thisIcon: '/static/image/iCreator.png',
      values: [],
      platform: process.platform,
      userInfo: {
        ID: '0',
        display_name: 'None',
        user_activation_key: '',
        user_email: '',
        user_login: '',
        user_nicename: '',
        user_registered: '',
        user_status: '',
        user_url: ''
      }
    }
  },
  watch: {
    now: v => {
      console.log(v)
    }
  },
  computed: {
    version() {
      return fs.readFileSync(path.join(this.root, 'version'))
    },
    config() {
      let config = path.join(os.homedir(), '.iDownloader')
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
  beforeCreate() {
    // this.$store.set('userinfo.username', 1)
  },
  methods: {
    getLocal(v) {
      let urls = this.$electron.ipcRenderer.sendSync('getLocal')
      if (urls) {
        let url = urls[0].replace(/\\/gi, '\\\\')
        eval(`this.${v} = '${url}'`)
      }
      console.log(urls)
    },
    logout() {
      // this.$store.del('userinfo')
      // this.$router.push('/login')
    },
    unique(arr) {
      let newArr = []
      for (let i = 0; i < arr.length; i++) {
        if (newArr.indexOf(arr[i]) == -1) {
          newArr.push(arr[i])
        }
      }
      return newArr
    },
    changeSoft(n) {
      this.now = n
      const loading = this.$loading({
        lock: true,
        text: `Initialization (0/0)...`,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      let softwares = this.list.filter(item => item.name === this.now)
      // this.software = softwares.length > 0 ? softwares[0] : null
      let soft = this.$store.get(this.now) || softwares.length > 0 ? softwares[0] : null
      console.log(`soft.displayName || soft.name ->`, soft.displayName || soft.name)
      this.getList(loading, soft.displayName || soft.name)
      // this.getSoftware()
    },
    pluginIsEx(plugin, softPath) {
      let dirPath = plugin.path
        ? eval(plugin.path[this.platform].replace(/\{self\}/, eval(softPath).replace(/\\/gi, '\\\\')))
        : ''
      return fs.existsSync(path.join(dirPath, plugin.name))
    },
    downloadPlugins(plugin, softPath) {
      return new Promise(resolve => {
        let dirPath = plugin.path[this.platform]
          ? eval(plugin.path[this.platform].replace(/\{self\}/, eval(softPath).replace(/\\/gi, '\\\\')))
          : ''
        console.log(`dir path ->`, dirPath)
        plugin.bar = 0
        console.log(`plugin ->`, plugin)
        let name = plugin.url.split('/').pop().split('?')[0]
        if (!fs.existsSync(path.join(os.tmpdir(), `iDownload`))) fs.mkdirSync(path.join(os.tmpdir(), `iDownload`))
        let savePath =
          process.platform === 'win32'
            ? path.join(os.homedir(), `Downloads/iDownload/${name}`)
            : path.join(os.homedir(), `Downloads/${name}`)
        console.log(`name ->`, name, savePath)
        this.$down({ url: plugin.url, path: savePath, local: this.local }, async (err, status) => {
          console.log(err, status)
          if (err) {
            plugin.bar = -1
            console.log(err)
            return alert(`Download ${plugin.name} is error: ${err.message}\r\nPlease try again!`)
          }
          if (status === 'done') {
            plugin.bar = 100
            if (name.split('.').pop() === 'zip' && dirPath !== '') {
              switch (process.platform) {
                case 'win32':
                  fs.createReadStream(savePath)
                    .pipe(unzip.Extract({ path: dirPath }))
                    .on('finish', async () => {
                      plugin.bar = -1
                    })
                    .on('error', e => {
                      this.$message.error(`Install error: ${e.message}`)
                    })
                  break

                case 'darwin':
                  try {
                    console.log(`unzip -o "${savePath}" -d "${dirPath}"`)
                    let r = await compressing.zip.uncompress(savePath, dirPath)
                    // let r = require('child_process').execSync(`unzip -o "${savePath}" -d "${dirPath}"`)
                    // this.$electron.shell.openExternal(`file://${savePath}`)
                    // console.log(`exec sync unzip ->`, r)
                    plugin.bar = -1
                  } catch (e) {
                    console.log(`exec sync unzip error ->`, e)
                    plugin.bar = -1
                  }

                  break

                case 'linux':
                  break
              }

              return
            } else {
              if (process.platform === 'win32') {
                console.log(require('child_process').exec(`cmd /C "${savePath}"`))
                plugin.bar = -1
              } else {
                this.$electron.shell
                  .openExternal(`file://${savePath}`)
                  .then(() => {
                    console.log(`ok`)
                    plugin.bar = -1
                  })
                  .catch(e => {
                    console.log(`e ->`, e)
                    plugin.bar = -1
                  })
              }
              resolve()
            }
          } else {
            plugin.bar = status
          }
        })
      })
    },
    async getSoftware() {
      const loading = this.$loading({
        lock: true,
        text: `Initialization ${this.now}...`,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      let softwares = this.list.filter(item => item.name === this.now)
      // this.software = softwares.length > 0 ? softwares[0] : null
      let soft = this.$store.get(this.now) || softwares.length > 0 ? softwares[0] : null
      this.loading = true
      this.thisIcon = soft.icon

      console.log(`softwares ->`, this.values)

      let values = this.values
      let versions = []

      switch (this.platform) {
        case 'win32':
          for (let o of Object.keys(values)) {
            // if (/-DisplayName$/gi.test(o)) console.log(`value ->`, o, values[o].value)
            if (new RegExp(soft.displayName || soft.name, 'gi').test(values[o].value) && /-DisplayName$/gi.test(o)) {
              console.log(
                `o ->`,
                o,
                values[o],
                values[o.replace('-DisplayName', '-DisplayVersion')],
                values[o.replace('-DisplayName', '-Comments')]
              )

              versions.push({
                value: values[o].value,
                version: values[o.replace('-DisplayName', '-DisplayVersion')]
                  ? values[o.replace('-DisplayName', '-DisplayVersion')].value
                  : values[o.replace('-DisplayName', '-Comments')]
                  ? values[o.replace('-DisplayName', '-Comments')].value
                  : values[o].value.match(/[0-9\.]+/)
                  ? values[o].value.match(/[0-9\.]+/)[0]
                  : 'None',
                key: o
              })
            }
          }
          break

        case 'darwin':
          switch (soft.displayName || soft.name) {
            case 'Python':
              let v = require('child_process').execSync(`python --version`).toString()
              console.log(`python ->`, v)
              versions.push({
                version: v.match(/[0-9\.]+/) ? v.match(/[0-9\.]+/)[0] : 'Missing',
                value: '0.0.0'
              })
              break

            default:
              for (let appName of Object.keys(values)) {
                try {
                  if (new RegExp(soft.displayName || soft.name, 'gi').test(appName)) {
                    versions.push({
                      version: values[appName].CFBundleShortVersionString,
                      value: '0.0.0'
                    })
                  }
                } catch (e) {
                  console.log(e)
                }
              }
              break
          }

          break
      }

      // console.log(`soft.displayName || soft.name ->`, soft.displayName || soft.name)
      console.log(`versions ->`, versions)
      soft.version = this.unique(versions.map(v => v.version || v.value.match(/([0-9\.]+)/gi)[0]))

      if (!soft.plugins) soft.plugins = []

      this.software = soft
      console.log(`soft ->`, soft)
      console.log(`done`)
      this.loading = false
      loading.close()
    },
    async download(soft) {
      if (soft[this.platform].constructor === Array) {
        for (let one of soft[this.platform]) {
          console.log(`one ->`, one)
          await this.downloadOne(soft, one)
        }
      } else {
        await this.downloadOne(soft, soft[this.platform])
      }
    },
    async downloadOne(soft, one) {
      return new Promise(resolve => {
        if (one.command) {
          alert(require('child_process').execSync(one.command).toString())
          return resolve()
        }
        if (one.isUrl) {
          this.$electron.shell.openExternal(one.url)
          return resolve()
        }
        let dirPath = one.path ? eval(one.path).replace(/[\\|\/]+oneDrive/gi, '') : ''
        console.log(`dir path ->`, dirPath)
        soft.bar = 0
        console.log(`soft ->`, soft)
        let name = one.url.split('/').pop().split('?')[0]
        if (!fs.existsSync(path.join(os.tmpdir(), `iDownload`))) fs.mkdirSync(path.join(os.tmpdir(), `iDownload`))
        let savePath =
          process.platform === 'win32'
            ? path.join(os.homedir(), `Downloads/iDownload/${name}`)
            : path.join(os.homedir(), `Applications/${name}`)
        if (process.platform === 'win32' && !fs.existsSync(path.dirname(savePath))) fs.mkdirSync(path.dirname(savePath))
        console.log(`name ->`, name, savePath)
        this.$down({ url: one.url, path: savePath, local: this.local }, async (err, status) => {
          console.log(err, status)
          if (err) {
            soft.bar = -1
            console.log(err)
            return alert(`Download ${soft.label} is error: ${err.message}\r\nPlease try again!`)
          }
          if (status === 'done') {
            if (name.split('.').pop() === 'zip' && dirPath !== '') {
              switch (process.platform) {
                case 'win32':
                  fs.createReadStream(savePath)
                    .pipe(unzip.Extract({ path: dirPath }))
                    .on('finish', async () => {
                      soft.bar = -1

                      if (one.extend) {
                        let command = one.extend
                          .replace(/\{root\}/gi, this.root)
                          .replace(/\{self\}/gi, dirPath)
                          .replace(/\\/gi, '\\\\')
                        try {
                          console.log('extend ->', command, eval(command))
                          resolve()
                        } catch (e) {
                          console.log(`command ->`, command)
                          console.log(e)
                        }
                      } else {
                        resolve()
                      }
                      // if (soft[this.platform].shortcut) {
                      //   require('child_process').execSync(
                      //     `"${path.join(this.root, 'command', soft[this.platform].shortcut)}"`
                      //   )
                      // }

                      // await regedit.createKey(['HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\makehuman-community'])
                      // await regedit.putValue({
                      //   'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\makehuman-community': {
                      //     DisplayName: {
                      //       value: 'makehuman-community',
                      //       type: 'REG_SZ'
                      //     },
                      //     DisplayVersion: {
                      //       value: soft[this.platform].version,
                      //       type: 'REG_SZ'
                      //     }
                      //   }
                      // })
                    })
                    .on('error', e => {
                      this.$message.error(`Install error: ${e.message}`)
                    })
                  break

                case 'darwin':
                  try {
                    console.log(`unzip -o "${savePath}" -d "${dirPath}"`)
                    // let r = await compressing.zip.uncompress(savePath, dirPath)
                    // let r = require('child_process').execSync(`unzip -o "${savePath}" -d "${dirPath}"`)
                    this.$electron.shell.openExternal(`file://${savePath}`)
                    // console.log(`exec sync unzip ->`, r)
                    soft.bar = -1
                  } catch (e) {
                    console.log(`exec sync unzip error ->`, e)
                    soft.bar = -1
                  }

                  break

                case 'linux':
                  break
              }

              return
            } else {
              console.log(`savePath ->`, savePath)
              soft.bar = 100
              if (process.platform === 'win32') {
                console.log(require('child_process').exec(`cmd /C "${savePath}"`))
                soft.bar = -1
              } else {
                this.$electron.shell
                  .openExternal(`file://${savePath}`)
                  .then(() => {
                    console.log(`ok`)
                    soft.bar = -1
                  })
                  .catch(e => {
                    console.log(`e ->`, e)
                    soft.bar = -1
                  })
              }
              resolve()
            }
          } else {
            soft.bar = status
          }
        })
      })
    },
    getList(loading, name = '') {
      console.log(`load reg list`)
      return new Promise((resolve, reject) => {
        this.$soft
          .list([
            'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
            'HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
            'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall'
          ])
          .then(async list => {
            // console.log(`list ->`, list)
            let _list = list
            //   .filter(l => {
            //   let _l = l.split('\\').pop()
            //   return _l.length === 36 || _l.length === 38
            // })
            // console.log(`_list ->`, _list)
            let listPath = path.join(this.config, `list.json`)
            let lists = []
            if (fs.existsSync(listPath)) {
              lists = JSON.parse(fs.readFileSync(listPath, 'utf8'))
            }

            let values = {}
            let valuePath = path.join(this.config, `values.json`)
            if (fs.existsSync(valuePath)) {
              values = Object.assign(values, JSON.parse(fs.readFileSync(valuePath, 'utf8')))
              if (Object.keys(values).length === 0) lists = []
            } else {
              lists = []
            }
            if (name !== '') {
              console.log(`do name`)
              // let _this = ''
              // for (let o of Object.keys(values)) {
              //   // if (/-DisplayName$/gi.test(o)) console.log(`value ->`, o, values[o].value)
              //   if (new RegExp(name, 'gi').test(values[o].value) && /-DisplayName$/gi.test(o)) {
              //     _this = o.replace(/-DisplayName$/gi, '')
              //     console.log(`reg ->`, o, _this)
              //     lists = lists.filter(l => l !== _this)
              //   }
              // }
              for (let o of Object.keys(values)) {
                let qians = o.split('-')
                qians.pop()
                let qian = qians.join('-')
                if (_list.filter(l => l === qian).length === 0) {
                  // if (_this === qian) {
                  //   console.log(`value ->`, o)
                  delete values[o]
                }
              }
            }
            fs.writeFileSync(listPath, JSON.stringify(_list, null, 2))
            let diff = _list.diff(lists)
            console.log(`_list.diff(lists) ->`, diff)

            if (diff.length > 0) {
              let size = 100
              let chunk = diff.chunk(size)
              let i = 0
              for (let l of chunk) {
                console.log(`l ->`, l)
                if (l) {
                  loading.text = `Initialization (${i}/${diff.length})...`
                  try {
                    let v = await this.$soft.value(l)
                    values = Object.assign(values, v)
                  } catch (e) {
                    console.log(`no data`)
                  }
                }
                i += l.length
              }
              loading.text = `Initialization (${i}/${diff.length})...`
            }

            // console.log(`values ->`, values)
            fs.writeFileSync(valuePath, JSON.stringify(values, null, 2))
            this.values = values
            this.getSoftware()
            loading.close()
            resolve()
          })
          .catch(e => {
            this.$message.error(e.message)
            loading.close()
            reject(e)
          })
      })
    }
  },
  mounted() {
    // fs.writeFileSync(path.join(this.config, `softwares.json`), JSON.stringify(this.list, null, 2))
    // this.$electron.shell.openExternal(path.join(this.config, `softwares.json`))
    let softPath = path.join(os.homedir(), `Downloads/softwares.json`)

    console.log(`softPath ->`, softPath)
    const loading = this.$loading({
      lock: true,
      text: `Loading config...`,
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    this.$down(
      { url: `https://creator.integem.com/wp-content/software.json`, path: softPath, local: this.local },
      (err, status) => {
        console.log(err, status)
        if (status !== 'done') return
        loading.close()
        if (fs.existsSync(softPath)) {
          let config
          try {
            config = fs.readFileSync(softPath, 'utf8')
            let softwares = JSON.parse(config)
            console.log('softwares ->', config)
            this.list = this.list
              .map(l => {
                let t = softwares.filter(s => s.name === l.name)[0]
                return Object.assign(l, t)
              })
              .filter(l => !l[process.platform].hide)
          } catch (e) {
            console.log(`config ->`, config)
            console.log(`read soft config error:`, e)
          }

          // console.log(`this.list ->`, this.list)
        }
      }
    )

    this.$nextTick(async () => {
      this.$store.set('userinfo', {})
      console.log(`this.$electron ->`, this.$electron)
      console.log(`this.$store.get('userinfo') ->`, this.$store.get('userinfo'))
      if (!this.$store.get('userinfo')) {
        this.$router.push('/login')
        return false
      } else {
        // const loading = this.$loading({
        //   lock: true,
        //   text: `Login...`,
        //   spinner: 'el-icon-loading',
        //   background: 'rgba(0, 0, 0, 0.7)'
        // })
        // let userInfo = this.$store.get('userinfo')
        // let res = await this.$axios.post('https://creator.integem.com/api.php?do=login', userInfo)
        // console.log(res)
        // if (!res.data.success) {
        //   this.$message.error(res.data.data)
        //   loading.close()
        //   return this.$router.push('/login')
        // } else {
        //   this.userInfo = res.data.data
        //   console.log(`this.userInfo ->`, this.userInfo)
        // }
        // loading.close()
      }

      const loading = this.$loading({
        lock: true,
        text: `Initialization (0/0)...`,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      switch (this.platform) {
        case 'win32':
          let soft = this.list[0]
          console.log(`soft.displayName || soft.name ->`, soft.displayName || soft.name)
          this.getList(loading, soft.displayName || soft.name)
          break

        case 'darwin':
          let apps = fs
            .readdirSync(path.join('/Applications'))
            .map(p => path.join('/Applications', p))
            .concat(
              fs
                .readdirSync(path.join(os.homedir(), '/Applications'))
                .map(p => path.join(os.homedir(), '/Applications', p))
            )
          console.log(`apps ->`, apps)
          let i = 1,
            values = {}
          for (let app of apps) {
            console.log(`app ->`, app)
            loading.text = `Initialization (${i}/${apps.length})...`
            try {
              let _plist = plist.parse(fs.readFileSync(path.join(app, 'Contents/Info.plist'), 'utf8'))
              console.log(`plist ->`, app.split('/').pop(), _plist)
              values[app.split('/').pop()] = _plist
            } catch (e) {
              console.log(e)
            }
            i++
          }
          this.values = values
          console.log(`values ->`, values)
          this.getSoftware()
          loading.close()
          break
      }
    })

    $(window).resize(() => {
      this.dom = {
        height: $(window).height(),
        width: $(window).width()
      }
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
