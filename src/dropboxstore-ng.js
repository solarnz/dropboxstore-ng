'use strict';
/* global Dropbox */
angular.module('dropboxstore-ng', [])

.factory('DropboxClientFactory', function(DROPBOX_APP_KEY) {
  var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
  return client;
})

/**
 * @ngdoc service
 * @name DropboxStore
 *
 * @description
 * This service is used to maintain the dropbox client, and wrap some
 * functionality to provide a more angular-like interface to the dropbox
 * datastores sdk.
 */
.service('DropboxStore', function($q, DropboxClientFactory) {
  var datastorePromise;

  this.client = DropboxClientFactory;

  /**
   * @ngdoc method
   * @name DropboxStore.authenticate
   * @methodOf DropboxStore
   *
   * @description
   * This authenticates the current user with dropbox.
   *
   * @param {Object} options An option containing any options you would like to
   * pass to the dropbox client.
   *
   * @returns {Promise} A promise that is resolved or rejected depending on if
   * authentication was successful.
   */
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

  /**
   * @ngdoc method
   * @name DropboxStore.getDataStore
   * @methodOf DropboxStore
   *
   * @description
   * A more angularish wrapper around the dropbox sdk in order to return the
   * default datastore to you in a promise.
   *
   * @return {Promise} A promise that is either resolved or rejected depending
   * on if we could retrieve the default datastore.
   */
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
