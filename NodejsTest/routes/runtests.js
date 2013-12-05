var _ = require('lodash');
require('../nodeunithack.js').hack();
var reporter = require('../generichtml');

var checkNecessaryData = function(req, message){
    if(!req.jsondata){ message.message = "No jsondata found!"; return false; }
    if(!req.jsondata.primarysid || req.jsondata.primarysid==='') { message.message = "No primarysid found!"; return false; }
    if(!req.jsondata.secondarysid || req.jsondata.secondarysid==='') { message.message = "No secondarysid found!"; return false; }
    if(!req.jsondata.tests || (!_.isString(req.jsondata.tests) && !_.isArray(req.jsondata.tests)) ) { message.message = "No selected tests found!"; return false; }
    return true;
};

exports.run = function(req, res){
    var message = {};
    if(!checkNecessaryData(req,message)){
        res.render('error', message);
    }
    else{
        if(_.isString(req.jsondata.tests)) { req.jsondata.tests = [ req.jsondata.tests ] };
        req.jsondata.tests = _.map(req.jsondata.tests, function(test) {
                return './tests/' + test + '.js';
            });
        var altConsole = {
                            _data: '',
                            log: function(data){
                                    this._data = this._data + data +'\n';
                                }
                        };
        reporter.run(req.jsondata.tests,{ testdata: req.jsondata }, function (failures){
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(altConsole._data);
            },altConsole);
    }
};