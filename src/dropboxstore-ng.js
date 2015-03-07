'use strict';
/* global Dropbox */
angular.module('dropboxstore-ng', [])

.factory('DropboxClientFactory', function(DROPBOX_APP_KEY) {
  var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
  return client;
})

.service('DropboxStore', function($q, DropboxClientFactory) {
  this.client = DropboxClientFactory;

  this.authenticate = function(options) {
    var promise = $q.defer();
    options = angular.extend({}, options);

    this.client.authenticate(options, function(error, client) {
      if (!error) {
        promise.resolve(client);
      } else {
        promise.reject(error);
      }
    });
    return promise.promise;
  };
});
