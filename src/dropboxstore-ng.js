'use strict';
/* global Dropbox */
angular.module('dropboxstore-ng', [])

.factory('DropboxClientFactory', function(DROPBOX_APP_KEY) {
  var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
  return client;
})

.service('DropboxStore', function($q, DropboxClientFactory) {
  var datastorePromise;

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

  this.getDataStore = function() {
    if (datastorePromise) {
      return datastorePromise;
    }

    var promise = $q.defer();
    datastorePromise = promise.promise;

    this.client.getDatastoreManager().openDefaultDatastore(
      function(error, datastore) {
        if (!error) {
          promise.resolve(datastore);
        } else {
          promise.reject(error);
        }
      }
    );
    return datastorePromise;
  };
});
