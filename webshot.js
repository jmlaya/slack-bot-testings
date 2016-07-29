'use strict';
var path = require('path');
var webshot = require('webshot');
var upload = require('./upload');

webshot('http://www.century21.com.ve/883094', '883094.png', function(err) {
  upload(path.resolve(process.cwd(), '883094.png')).then(function(metadata){
    console.log(metadata);
  });
});
