var exec = require('child_process').exec;
var fs = require('fs');
var packages = require('./package.json');

Object.keys(packages.devDependencies).forEach(function(key) {
    exec('npm remove --save-dev ' + key, function(err, stdout, stderr) {
        console.log(stdout);
    });
});

