const Q = require('q');
const fs = require('graceful-fs');
const File = require(__dirname + "/File.js");

/**
 * Loads a File from disk.
 *
 * @param {string} path The file path.
 * @param {function|null} cb (optional)
 *
 * @return {Promise}
 */
function loadFile(path, cb) {
    const file = new File();
    file.path = path;

    // Load the file content (if it exists).
    const pCode = Q.nfcall(fs.readFile, file.path, "UTF-8");
    return pCode
        .then(function (code) {
            file.code = file.originalCode = code;
            if (cb) cb(null, file);
            return file;
        })
        .catch(function (err) {
            if (err.code !== 'ENOENT' && cb) return cb(err);
            if (err.code !== 'ENOENT') throw err;
            file.code = "";
            return file;
        });
}

module.exports = loadFile;
