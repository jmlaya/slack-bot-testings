'use strict';

var NorrisBot = require('./norrisbot');

var token = "xoxb-51879176804-SPFILRJzalbbZLq2Sv0lBiIE";
var name = "website";

var norrisbot = new NorrisBot({
    token: token,
    name: name
});

//norrisbot.run();

var Bot = require('slackbots');

Bot.prototype.deleteMessage = function(id, ts) {
  console.log(id, ts);
    var params = {
        channel: id,
        ts: ts,
        is_bot: true
    };

    return this._api('chat.delete', params);
};

Bot.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text);
};

Bot.prototype._isChannelConversation = function (message) {
    return typeof message.channel === 'string' &&
        message.channel[0] === 'C';
};

Bot.prototype._getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};

Bot.prototype._isMentioningUser = function (message) {
    return message.text.toLowerCase().indexOf(this.user) > -1 ||
        message.text.toLowerCase().indexOf(this.name) > -1;
};

Bot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};


// create a bot
var settings = {
    token: 'xoxb-52138520455-4eV6JdSbgKGNJdCFiTpani9J',
    postToken: 'xoxp-51589340438-51597518197-52182823761-f3b39b55bb',
    name: 'blockbot'
};
var bot = new Bot(settings);

bot.on('message', function(message){
  console.log(message);
  if(this._isChatMessage(message) && this._isChannelConversation(message)){
    this.deleteMessage(message.channel, message.ts).then(function(data){
      console.log(data);
    }).catch(function(err){
      console.log(err);
    });
  }
});

bot.on('start', function() {
    this.token = settings.postToken;
    bot.postMessageToChannel('random', 'Hello channel!');
    bot.postMessageToUser('jmlaya', 'Hello bro!');
    //bot.postMessageToGroup('some-private-group', 'hello group chat!');
});
