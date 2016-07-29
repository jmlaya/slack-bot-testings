import slack from 'slack'

let bot = slack.rtm.client()
let token = 'xoxb-51879176804-SPFILRJzalbbZLq2Sv0lBiIE'

bot.hello(message=> {
  console.log(`Got a message: ${JSON.stringify(message)}`)
  bot.close()
})

bot.listen({token})
