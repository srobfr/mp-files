const cp = require('child_process');
const fs = require('graceful-fs');
const Q = require('q');
const tmp = require('tmp');
const mkdirp = require('mkdirp');
const Path = require('path');

/**
 * This represents a file.
 *
 * @constructor
 */
function File() {
    const that = this;

    /**
     * The file path.
     * @type {string}
     */
    this.path = null;

    /**
     * The file content (utf8 string).
     * @type {string}
     */
    this.code = null;

    /**
     * The original file content at loading time (utf8 string). Null if the file did not exist.
     *
     * @type {string}
     */
    this.originalCode = null;

    /**
     * Saves the file on disk if the content have been modified.
     *
     * Returns true if something have been saved, otherwise returns false.
     *
     * @returns {Promise.<boolean>}
     */
    this.save = function () {
        if (that.code === that.originalCode) {
            return Q(false); // Nothing changed.
        }

        // Try to create the parent folder.
        const pMkdir = Q.nfcall(mkdirp, Path.dirname(that.path));

        // Write the new content.
        const pWrite = pMkdir.then(function () {
            return Q.nfcall(fs.writeFile, that.path, that.code);
        });

        return pWrite.then(function () {
            return true; // Something have been saved.
        });
    };

    /**
     * Returns the universal diff.
     *
     * @param color {boolean} True to (try to) use colordiff.
     *
     * @returns {Promise.<string>}
     */
    this.getDiff = function (color) {
        // Optimization
        if (that.code === that.originalCode) return Q("");
        color = (color === undefined ? true : color);

        const pTmpPath = Q.nfcall(tmp.tmpName);

        // Write the file contents
        const pWrite = pTmpPath.then(function (tmpPath) {
            return Q.nfcall(fs.writeFile, tmpPath, that.code);
        });

        // Run the diff process
        const pDiff = Q.all([pTmpPath, pWrite]).spread(function (tmpPath) {
            const diff = (color ? "colordiff" : "diff");
            const d = Q.defer();
            const diffCp = cp.spawn(diff, ["-uN", that.path, tmpPath]);
            let stderr = "", stdout = "";
            diffCp.stdout.on('data', function (data) {
                stdout += data;
            });

            diffCp.stderr.on('data', function (data) {
                stderr += data;
            });

            diffCp.on('close', function (code) {
                return (code < 2 ? d.resolve(stdout) : d.reject(new Error(`Code ${code} : ${stderr}`)));
            });

            return d.promise;
        });

        const pCleanup = Q.all([pTmpPath, pDiff]).spread(function (tmpPath) {
            fs.unlink(tmpPath);
        });

        return Q.all([pDiff, pCleanup]).spread(function (diff) {
            return diff;
        });
    };
}

module.exports = File;
