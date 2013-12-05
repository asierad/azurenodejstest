
/*
 * GET home page.
 */

exports.index = function(req, res){
    var path = require('path');
    var testdir = path.join(__dirname, '..\\tests');
    var testfiles = require('fs').readdirSync(testdir);
    var _ = require('lodash');
    testfiles = 
        _.map(
            testfiles, 
            function(testfile) { 
                return { 
                    path: path.join(testdir, testfile),
                    name: /.js$/.test(testfile) ? testfile.substring(0, testfile.length - 3) : testfile,
                    tests: []
                }; 
            });
    _.forEach(testfiles, function (testfile){
            _.forOwn(require(testfile.path), function(elem, key) {
                    if(typeof elem === 'function'){
                        testfile.tests.push(key);
                    }
                });
        });
  res.render('index', { data: testfiles });
};