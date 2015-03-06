'use strict';
/* global Dropbox */
angular.module('dropboxstore-ng', [])

.factory('DropboxClientFactory', function(DROPBOX_APP_KEY) {
  var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
  return client;
})

.service('DropboxStore', function(DropboxClientFactory) {
  this.client = DropboxClientFactory;
});
