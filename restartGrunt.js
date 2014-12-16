var exec = require('child_process').exec;

exec('kill ' + process.argv[1] + '&& grunt', function(err, stdout, stderr) {
    console.log('error: \n' + err);
});

setTimeout(function() {console.log('a')}, 5000);
