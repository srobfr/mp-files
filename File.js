const cp = require('child_process');
const fs = require('graceful-fs');
const Q = require('q');
const tmp = require('tmp');

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

        const codesToCompare = [that.originalCode, that.code];

        // Create two stream files handlers to feed the diff utility.
        const psTmpPaths = codesToCompare.map(function () {
            return Q.nfcall(tmp.tmpName);
        });

        const pTmpPaths = Q.all(psTmpPaths);

        // Open an write the file contents
        const psWriteTmpFiles = psTmpPaths.map(function (pTmpPath, i) {
            return pTmpPath.then(function (tmpPath) {
                return Q.nfcall(fs.writeFile, tmpPath, codesToCompare[i]);
            });
        });

        // Run the diff process
        const pDiff = Q.all([Q.all(psWriteTmpFiles), pTmpPaths]).spread(function (ignored, tmpPaths) {
            const originalStreamPath = tmpPaths[0];
            const streamPath = tmpPaths[1];
            const diff = (color ? "colordiff" : "diff");
            const d = Q.defer();
            const diffCp = cp.spawn(diff, ["-uN", originalStreamPath, streamPath]);
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

        const pCleanup = Q.all([pDiff, pTmpPaths]).spread(function (ignored, tmpPaths) {
            tmpPaths.map((path) => {
                fs.unlink(path);
            });
        });

        return Q.all([pDiff, pCleanup]).spread(function(diff) {
            return diff;
        });
    };
}

module.exports = File;
