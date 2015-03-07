'use strict';

/* global Dropbox */
describe('dropboxstore-ng', function() {
  var $rootScope;
  var DROPBOX_APP_KEY = 'hello there world!!';

  var DropboxClientMock = function() {
    return {
      authenticate: function() {},
      getDatastoreManager: function() {}
    };
  };
  var dropboxClient;

  beforeEach(function() {
    module('dropboxstore-ng');
  });
  beforeEach(module(function($provide) {
    $provide.value('DROPBOX_APP_KEY', DROPBOX_APP_KEY);

    dropboxClient = new DropboxClientMock();
    spyOn(Dropbox, 'Client').and.returnValue(dropboxClient);
  }));

  beforeEach(inject(function(_$rootScope_) {
    $rootScope = _$rootScope_;
  }));

  describe('DropboxClientFactory factory', function() {
    var DropboxClientFactory;

    beforeEach(inject(function(_DropboxClientFactory_) {
      DropboxClientFactory = _DropboxClientFactory_;
    }));

    it('should return a Dropbox client', function() {
      expect(DropboxClientFactory).toEqual(dropboxClient);
    });

    it('should call the client with the configure api key', function() {
      expect(Dropbox.Client).toHaveBeenCalledWith({key: DROPBOX_APP_KEY});
    });
  });

  describe('DropboxStore service', function() {
    var DropboxStore;

    beforeEach(inject(function(_DropboxStore_) {
      DropboxStore = _DropboxStore_;
    }));

    it('should have a dropbox client assigned to \'client\'', function() {
      expect(DropboxStore.client).toEqual(dropboxClient);
    });

    describe('authenticate method', function() {
      beforeEach(function() {
        spyOn(dropboxClient, 'authenticate');
      });

      it('should pass the options passed into it to the authenticate function',
      function() {
        var options = {interactive: false};
        DropboxStore.authenticate(options);
        expect(dropboxClient.authenticate).toHaveBeenCalledWith(
          options, jasmine.any(Function)
        );
      });

      it('should pass an empty object to authenticate if options is undefined',
      function() {
        DropboxStore.authenticate();
        expect(dropboxClient.authenticate).toHaveBeenCalledWith(
          {}, jasmine.any(Function)
        );
      });

      it('should return a promise', function() {
        var returnValue = DropboxStore.authenticate();
        expect(returnValue.then).toEqual(jasmine.any(Function));
      });

      describe('authentication succeeding', function() {
        var resolved, resolvedValue;

        beforeEach(function() {
          dropboxClient.authenticate.and.callFake(function(options, cb) {
            cb(null, dropboxClient);
          });

          DropboxStore.authenticate().then(function(value) {
            resolved = true;
            resolvedValue = value;
          });

          $rootScope.$apply();
        });

        it('should resolve the promise', function() {
          expect(resolved).toBeTruthy();
        });

        it('should resolve with the client', function() {
          expect(resolvedValue).toEqual(dropboxClient);
        });
      });

      describe('authentication failing', function() {
        var rejected, rejectedValue;

        beforeEach(function() {
          dropboxClient.authenticate.and.callFake(function(options, cb) {
            cb('error');
          });

          DropboxStore.authenticate().catch(function(value) {
            rejected = true;
            rejectedValue = value;
          });

          $rootScope.$apply();
        });

        it('should reject the promise', function() {
          expect(rejected).toBeTruthy();
        });

        it('should rejected with the error passed through', function() {
          expect(rejectedValue).toEqual('error');
        });
      });
    });

    describe('getDataStore method', function() {
      var openDefaultDatastoreSpy;
      var DropboxStore;

      beforeEach(inject(function(_DropboxStore_) {
        DropboxStore = _DropboxStore_;

        openDefaultDatastoreSpy = jasmine.createSpy();
        spyOn(dropboxClient, 'getDatastoreManager').and.returnValue(
          {openDefaultDatastore: openDefaultDatastoreSpy}
        );
      }));

      it('should call getDatastoreManager on the dropbox client', function() {
        DropboxStore.getDataStore();
        expect(dropboxClient.getDatastoreManager).toHaveBeenCalledWith();
      });

      it('should call openDefaultDatastore on the datastore manager',
      function() {
        DropboxStore.getDataStore();
        expect(openDefaultDatastoreSpy).toHaveBeenCalledWith(
          jasmine.any(Function)
        );
      });

      it('should return a promise', function() {
        var returnValue = DropboxStore.getDataStore();
        expect(returnValue.then).toEqual(jasmine.any(Function));
      });

      describe('when getting the datastore succeeds', function() {
        var resolved, resolvedValue;
        beforeEach(function() {
          openDefaultDatastoreSpy.and.callFake(function(cb) {
            cb(null, {});
          });

          DropboxStore.getDataStore().then(function(value) {
            resolved = true;
            resolvedValue = value;
          });

          $rootScope.$apply();
        });

        it('should resolve the promise', function() {
          expect(resolved).toBeTruthy();
        });

        it('should resolve the promise with the datastore', function() {
          expect(resolvedValue).toEqual({});
        });
      });

      describe('when getting the datastore fails', function() {
        var rejected, rejectedValue;
        beforeEach(function() {
          openDefaultDatastoreSpy.and.callFake(function(cb) {
            cb('error');
          });

          DropboxStore.getDataStore().catch(function(value) {
            rejected = true;
            rejectedValue = value;
          });

          $rootScope.$apply();
        });

        it('should reject the promise', function() {
          expect(rejected).toBeTruthy();
        });

        it('should reject the promise with the datastore', function() {
          expect(rejectedValue).toEqual('error');
        });
      });

      describe('fetching the datastore twice', function() {
        var DataStoreMock = function() {return {insert: function() {}};};
        var dataStore, newDataStore;

        beforeEach(function() {
          openDefaultDatastoreSpy.and.callFake(function(cb) {
            cb(null, new DataStoreMock());
          });

          DropboxStore.getDataStore().then(function(value) {
            dataStore = value;
          });
          $rootScope.$apply();

          DropboxStore.getDataStore().then(function(value) {
            newDataStore = value;
          });
          $rootScope.$apply();
        });

        it('should cache the first datastore', function() {
          expect(newDataStore).toEqual(dataStore);
        });

        it('should only call getDatastoreManager once', function() {
          expect(dropboxClient.getDatastoreManager.calls.count()).toEqual(1);
        });

        it('should only call openDefaultDatastore once', function() {
          expect(openDefaultDatastoreSpy.calls.count()).toEqual(1);
        });
      });
    });
  });
});
