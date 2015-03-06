'use strict';

/* global Dropbox */
describe('dropboxstore-ng', function() {
  var DROPBOX_APP_KEY = 'hello there world!!';

  var DropboxClientMock = function() {
    return {
      auth: function() {}
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
  });
});
