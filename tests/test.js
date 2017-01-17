const mpFiles = require(__dirname + "/../index.js");
const assert = require('assert');

describe('mpFiles', function () {
    it('should load an existing file', function () {
        const path = __dirname + "/testFile.txt";
        const pFile = mpFiles(path);
        return pFile.then(function(file) {
            console.log(require("util").inspect(file));
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

    it('should diff existing file', function () {
        const path = __dirname + "/testFile.txt";
        const pFile = mpFiles(path);
        const pDiff = pFile.then((file) => {
            file.code = "Foo\n";
            return file.getDiff(false);
        });
        return pDiff.then(function(diff) {
            assert(diff.match(/@@ -1 \+1 @@\n-FooBar\n\+Foo\n$/));
        });
    });

    it('should diff non existing file', function () {
        const path = __dirname + "/foo.txt";
        const pFile = mpFiles(path);
        const pDiff = pFile.then((file) => {
            file.code = "Foo\n";
            return file.getDiff(false);
        });
        return pDiff.then(function(diff) {
            console.log(diff);
            assert(diff.match(/@@ -0,0 \+1 @@\n\+Foo\n$/));
        });
    });
});

