const Q = require('q');
const fs = require('graceful-fs');
const File = require(__dirname + "/File.js");
const iconv = require('iconv-lite');

/**
 * Loads a File from disk.
 *
 * @param {string} path The file path.
 * @param {string} encoding The file encoding. Defaults to UTF-8.
 * @param {function|null} cb (optional)
 *
 * @return {Promise}
 */
function loadFile(path, encoding, cb) {
    const file = new File();
    file.path = path;
    file.encoding = encoding || "UTF-8";

    // Load the file content (if it exists).
    const pCodeBuffer = Q.nfcall(fs.readFile, file.path);
    return pCodeBuffer
        .then(function (codeBuffer) {
            const code = iconv.decode(codeBuffer, file.encoding);
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
