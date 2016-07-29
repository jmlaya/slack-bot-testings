var config = require('../vivaldi/config').googleDrive;
var fs = require("fs");
var path = require("path");
var async = require('async');
var mime = require("mime");
//var cdn = config.cdns[0];
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(config.client_id, config.client_secret, config.redirect_uri);
var drive = google.drive('v3');

function send(file, mimeType, callback){

  async.waterfall([

    function(cb){
      fs.stat(file, function(err, stats){
        if(!err){
          cb(null, stats);
        } else {
          cb(err);
        }
      });
    },

    function(stats, cb){
      let found = false;

      config.cdns.forEach(function(cdn){

        oauth2Client.setCredentials({
          access_token: cdn.tokens.access,
          refresh_token: cdn.tokens.refresh
        });

        oauth2Client.refreshAccessToken(function(err, tokens) {
          drive.about.get({
            fields:'storageQuota',
            auth: oauth2Client
          }, function(err, response){
            if(!found){
              if(!err){
                var storageQuota = response.storageQuota,
                    available = parseInt(storageQuota.limit) - (parseInt(storageQuota.usageInDrive) + parseInt(storageQuota.usageInDriveTrash));

                if(available > stats.size){
                  found = true;
                  cb(null, cdn);
                }
              } else {
                found = true;
                cb(err);
              }
            }
          });
        });
      });
    },

    function(cdn, cb){
      oauth2Client.setCredentials({
        access_token: cdn.tokens.access,
        refresh_token: cdn.tokens.refresh
      });

      cb(null, cdn);
    },

    function(cdn, cb){
      oauth2Client.refreshAccessToken(function(err, tokens) {
        cb(null, cdn);
      });
    },

    function(cdn, cb){

      drive.files.create({
        resource: {
          name: path.basename(file),
          mimeType: mimeType,
          parents: [cdn.folders.docs]
        },
        media: {
          mimeType: mimeType,
          body: fs.createReadStream(file)
        },
        auth: oauth2Client
      }, function(err, metadata){
        if(!err){
          cb(null, metadata);
        } else {
          cb(err);
        }
      });

    },

    function(metadata, cb){

      drive.permissions.create({
        resource: {
          'type': 'anyone',
          'role': 'reader'
        },
        fileId: metadata.id,
        fields:'id',
        auth: oauth2Client
      },function(err){
        if(!err){
          cb(null, metadata);
        } else {
          cb(err);
        }
      })
    },

    function(metadata, cb){
      drive.files.get({
        fileId: metadata.id,
        auth: oauth2Client,
        fields: "webContentLink,thumbnailLink"
      },cb)
    }

  ], function(err, metadata){
    if(err){
      callback(err);
    } else {
      callback(null, metadata);
    }
  });
}

module.exports = function(file){
  return new Promise(function(resolve, reject){
    var mimeType = mime.lookup(file);
    send(file, mimeType, function(err, metadata){
      if (err) {
        reject(err);
      }else {
        resolve(metadata);
      }
    });
  });
}

// Retrieve tokens via token exchange explained above or set them:
