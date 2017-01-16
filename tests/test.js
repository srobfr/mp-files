const mpFiles = require(__dirname + "/../index.js");
const assert = require('assert');

describe('mpFiles', function () {
    it('should load an existing file', function () {
        const path = __dirname + "/testFile.txt";
        const pFile = mpFiles(path);
        return pFile.then(function(file) {
            assert.equal(file.code, "FooBar\n");
            assert.equal(file.originalCode, "FooBar\n");
            assert.equal(file.path, path);
        });
    });
    it('should load a non-existing file', function () {
        const path = __dirname + "/foo.txt";
        const pFile = mpFiles(path);
        return pFile.then(function(file) {
            assert.equal(file.code, "");
            assert.equal(file.originalCode, null);
            assert.equal(file.path, path);
        });
    });
});
