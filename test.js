import Poe from 'quora-poe.js'

// poe
let bot = new Poe()
bot
  .start()
  .then(async () => {
    /**
     * https://www.npmjs.com/package/quora-poe.js
     */
    // let answer = await this.bot.ask('Hello!', 'gpt-4')
    let conversation = [
      {
        role: 'user',
        content: 'My name is John'
      },
      {
        role: 'ai',
        content:
          'Hello John! How can I help you today? If you have any questions or need assistance, please feel free to ask.Hello John! How can I help you today? If you have any questions or need assistance, please feel free to ask.'
      }
    ]
    let answer = await bot.send(conversation, 'gpt-4')
    console.log(answer)
  })
  .catch(e => {
    console.log(e)
  })
