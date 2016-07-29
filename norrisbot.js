'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Bot = require('slackbots');
var webshot = require('webshot');
var upload = require('./upload');

var NorrisBot = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'norrisbot';
    this.dbPath = settings.dbPath || path.resolve(process.cwd(), 'data', 'norrisbot.db');

    this.user = null;
    this.db = null;
};

// inherits methods and properties from the Bot constructor
util.inherits(NorrisBot, Bot);

NorrisBot.prototype.run = function () {
    NorrisBot.super_.call(this, this.settings);

    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

NorrisBot.prototype._onStart = function () {
    this._loadBotUser();
    this._connectDb();
    this._firstRunCheck();
};

NorrisBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

NorrisBot.prototype._connectDb = function () {
    if (!fs.existsSync(this.dbPath)) {
        console.error('Database path ' + '"' + this.dbPath + '" does not exists or it\'s not readable.');
        process.exit(1);
    }

    this.db = new SQLite.Database(this.dbPath);
};

NorrisBot.prototype._firstRunCheck = function () {
    var self = this;
    self.db.get('SELECT val FROM info WHERE name = "lastrun" LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        var currentTime = (new Date()).toJSON();

        // this is a first run
        if (!record) {
            self._welcomeMessage();
            return self.db.run('INSERT INTO info(name, val) VALUES("lastrun", ?)', currentTime);
        }

        // updates with new last running time
        self.db.run('UPDATE info SET val = ? WHERE name = "lastrun"', currentTime);
    });
};

NorrisBot.prototype._welcomeMessage = function () {
    this.postMessageToChannel(this.channels[0].name, 'Hi guys, roundhouse-kick anyone?' +
        '\n I can tell jokes, but very honest ones. Just say `Chuck Norris` or `' + this.name + '` to invoke me!',
        {as_user: true});
};

NorrisBot.prototype._onMessage = function (message) {

    var self = this;

    if(this._isChatMessage(message) && !this._isChannelConversation(message) && !this._isFromNorrisBot(message)){

      var user = self._getUserById(message.user);
      self.postMessageToUser(user.name, "Espere un momento por favor...", {as_user: true});

      webshot('http://www.century21.com.ve/'+message.text, message.text + '.png', function(err) {
        upload(path.resolve(process.cwd(), message.text + '.png')).then(function(metadata){
          self.postMessageToUser(user.name, '', {
            as_user: true,
            "attachments": [
                {
                    "fallback": "Propiedad " + message.text + " exclusiva de CENTURY 21",
                    "color": "#36a64f",
                    "pretext": "Propiedad exclusiva de CENTURY 21",
                    "author_name": "CENTURY 21 Venezuela",
                    "author_link": "http://flickr.com/bobby/",
                    "title": "Detalle de esta propiedad",
                    "title_link": "http://www.century21.com.ve/" + message.text,
                    "text": "Imagen capturada del estado actual de la propiedad",
                    "image_url": metadata.thumbnailLink.replace("=s220",""),
                    "thumb_url": metadata.thumbnailLink
                }
            ]
          });

          console.log(metadata);
        });
      });

    }
    /*
    if (this._isChatMessage(message) &&
        this._isChannelConversation(message) &&
        !this._isFromNorrisBot(message) &&
        this._isMentioningChuckNorris(message)
    ) {
        this._replyWithRandomJoke(message);
    }*/
};

NorrisBot.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text);
};

NorrisBot.prototype._isChannelConversation = function (message) {
    return typeof message.channel === 'string' &&
        message.channel[0] === 'C';
};

NorrisBot.prototype._isFromNorrisBot = function (message) {
    return message.user === this.user.id;
};

NorrisBot.prototype._isMentioningChuckNorris = function (message) {
    return message.text.toLowerCase().indexOf('chuck norris') > -1 ||
        message.text.toLowerCase().indexOf(this.name) > -1;
};

NorrisBot.prototype._replyWithRandomJoke = function (originalMessage) {
    var self = this;
    self.db.get('SELECT id, joke FROM jokes ORDER BY used ASC, RANDOM() LIMIT 1', function (err, record) {
        if (err) {
            return console.error('DATABASE ERROR:', err);
        }

        var channel = self._getChannelById(originalMessage.channel);
        self.postMessageToChannel(channel.name, record.joke, {as_user: true});
        self.db.run('UPDATE jokes SET used = used + 1 WHERE id = ?', record.id);
    });
};

NorrisBot.prototype._getChannelById = function (channelId) {
    return this.channels.filter(function (item) {
        return item.id === channelId;
    })[0];
};

NorrisBot.prototype._getUserById = function (userId) {
    return this.users.filter(function (item) {
        return item.id === userId;
    })[0];
};

NorrisBot.prototype.deleteMessage = function(id, ts) {
    params = extend({
        channel: id,
        username: this.name,
        as_user: true
    },{});

    return this._api('chat.delete', params);
};

module.exports = NorrisBot;
