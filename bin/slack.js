'use strict';

var _slack = require('slack');

var _slack2 = _interopRequireDefault(_slack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bot = _slack2.default.rtm.client();
var token = 'xoxb-51879176804-SPFILRJzalbbZLq2Sv0lBiIE';

bot.hello(function (message) {
  console.log('Got a message: ' + JSON.stringify(message));
  bot.close();
});

bot.listen({ token: token });