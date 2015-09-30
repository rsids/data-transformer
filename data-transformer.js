var fs = require('fs'),
    path = require('path');

function dataTransformer(options) {
    'use strict';

    options.src = addSlash(options.src);
    options.dest = addSlash(options.dest);
    var src = getSourceFiles('');


    src.forEach(function (file) {
        fs.readFile(file, 'utf8', function (err, data) {
            if (err) {
                throw err;
            }

            var transformed = options.transform({filename: file.replace(options.src,''), data:data});
            saveTransformed(transformed);
        });
    });


    /**
     * Recursively reads the source directory and returns an array of files to transform
     * @param path
     * @returns {Array}
     */
    function getSourceFiles(path) {
        var files = fs.readdirSync(options.src + path),
            result = [];

        files.forEach(function (item) {
            var stats = fs.statSync(options.src + path + item);
            if (stats.isDirectory()) {
                result = [].concat(result, getSourceFiles(path + item + '/'));
            } else {
                result.push(options.src + path + item);
            }
        });

        return result;
    }

    /**
     * Save transformed files
     * @param obj
     */
    function saveTransformed(obj) {
        var path = obj.filename.split('/'),
            filename = path.pop(),
            fullpath = options.dest;

        // Create missing folders
        path.forEach(function(folder) {
            fullpath += folder + '/';
            try {
                fs.accessSync(fullpath, fs.F_OK);
            } catch(e) {
                fs.mkdirSync(fullpath);
            }
        });

        fs.writeFile(fullpath + filename, obj.data, 'utf8');
    }

    /**
     * Adds a trailing slash to the path
     * @param path
     * @returns {*}
     */
    function addSlash(path) {
        if (path.substring(path.length - 1) !== '/') {
            path += '/';
        }
        return path;
    }


}

module.exports = dataTransformer;