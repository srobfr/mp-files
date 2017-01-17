# mp-files

This is a file content manipulation helper, originally intended to be used in automated
source code files manipulation tools.

# Installation

Using npm : 

    npm install mp-files --save
    
or using yarn :

    yarn add mp-files

# Usage

## Opening a file

    const mpFiles = require("mp-files");
    
    const filePromise = mpFiles("/my/file.txt");
    filePromise.then(function(file) {
        console.log(require("util").inspect(file));
        /* 
            Here you should see something like this (depending on the file content) :
            
            File {
              path: '/my/file.txt',
              code: 'FooBar\n',
              originalCode: 'FooBar\n',
              save: [Function],
              getDiff: [Function] }
        */
    });
    
## Getting a universal diff

    const mpFiles = require("mp-files");
    
    const filePromise = mpFiles("/my/file.txt");
    const diffPromise = filePromise.then(function(file) {
        console.log(file.code); // Shows the file content
        file.code += "\nNew file content\n";
        return file.getDiff(); // Diffs original versus current file code.
    });
    
    diffPromise.then(function(diff) {
        console.log(diff); 
        /* 
            Here you should see something like this :
            
            --- /my/file.txt            	1970-01-01 01:00:00.000000000 +0100
            +++ /tmp/tmp-19013mZ6Q40sOPggy	2017-01-17 13:10:01.148009597 +0100
            @@ -1,1 +1 @@
            +New file content
        */
    });

## Saving a file

    const mpFiles = require("mp-files");
    
    const filePromise = mpFiles("/my/file.txt");
    
    const fileSavePromise = filePromise.then(function(file) {
        file.code = "New content";

        return file.save();
    });
    
    fileSavePromise.then(function() {
        // Here /my/file.txt contains "New content".
    });
