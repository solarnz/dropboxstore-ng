'use strict';

/* global Dropbox */
describe('dropboxstore-ng', function() {
  var $rootScope;
  var DROPBOX_APP_KEY = 'hello there world!!';

  var DropboxClientMock = function() {
    return {
      authenticate: function() {}
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
  });
});
