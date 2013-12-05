exports.hack = function () {
    var nodeunit = require('nodeunit');
    var nodeunitcore = require('nodeunit/lib/core');
    var types = require('nodeunit/lib/types');
    var async = require('nodeunit/deps/async');
    nodeunitcore.runTest = function (name, fn, opt, callback) {
        var options = types.options(opt);

        options.testStart(name);
        var start = new Date().getTime();
        var test = types.test(name, start, options, callback);

        try {
            //added testdata to tests
            fn(test, opt.testdata);
        }
        catch (e) {
            test.done(e);
        }
    };

    var getSerialCallback = function (fns) {
        if (!fns.length) {
            return null;
        }
        return function (callback) {
            var that = this;
            var bound_fns = [];
            for (var i = 0, len = fns.length; i < len; i++) {
                (function (j) {
                    bound_fns.push(function () {
                        return fns[j].apply(that, arguments);
                    });
                })(i);
            }
            return async.series(bound_fns, callback);
        };
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };


    var _copy = function (obj) {
        var nobj = {};
        var keys = _keys(obj);
        for (var i = 0; i <  keys.length; i += 1) {
            nobj[keys[i]] = obj[keys[i]];
        }
        return nobj;
    };

    var wrapTest = function (setUp, tearDown, fn) {
        //added testdata
        return function (test, testdata) {
            var context = {};
            if (tearDown) {
                var done = test.done;
                test.done = function (err) {
                    try {
                        tearDown.call(context, function (err2) {
                            if (err && err2) {
                                test._assertion_list.push(
                                    types.assertion({error: err})
                                );
                                return done(err2);
                            }
                            done(err || err2);
                        });
                    }
                    catch (e) {
                        done(e);
                    }
                };
            }
            if (setUp) {
                setUp.call(context, function (err) {
                    if (err) {
                        return test.done(err);
                    }
                    //added testdata
                    fn.call(context, test, testdata);
                });
            }
            else {
                //added testdata
                fn.call(context, test, testdata);
            }
        };
    };

    var wrapGroup = function (group, setUps, tearDowns) {
        var tests = {};

        var setUps = setUps ? setUps.slice(): [];
        var tearDowns = tearDowns ? tearDowns.slice(): [];

        if (group.setUp) {
            setUps.push(group.setUp);
            delete group.setUp;
        }
        if (group.tearDown) {
            tearDowns.unshift(group.tearDown);
            delete group.tearDown;
        }

        var keys = _keys(group);

        for (var i = 0; i < keys.length; i += 1) {
            var k = keys[i];
            if (typeof group[k] === 'function') {
                tests[k] = wrapTest(
                    getSerialCallback(setUps),
                    getSerialCallback(tearDowns),
                    group[k]
                );
            }
            else if (typeof group[k] === 'object') {
                tests[k] = wrapGroup(group[k], setUps, tearDowns);
            }
        }
        return tests;
    };

    nodeunitcore.runModule = function (name, mod, opt, callback) {
        var options = _copy(types.options(opt));

        var _run = false;
        var _moduleStart = options.moduleStart;

        mod = wrapGroup(mod);

        function run_once() {
            if (!_run) {
                _run = true;
                _moduleStart(name);
            }
        }
        options.moduleStart = run_once;

        var start = new Date().getTime();

        nodeunitcore.runSuite(null, mod, options, function (err, a_list) {
            var end = new Date().getTime();
            var assertion_list = types.assertionList(a_list, end - start);
            options.moduleDone(name, assertion_list);
            if (nodeunit.complete) {
                nodeunit.complete(name, assertion_list);
            }
            callback(null, a_list);
        });
    };

    nodeunitcore.runSuite = function (name, suite, opt, callback) {
        suite = wrapGroup(suite);
        var keys = _keys(suite);

        async.concatSeries(keys, function (k, cb) {
            var prop = suite[k], _name;

            _name = name ? [].concat(name, k) : [k];
            _name.toString = function () {
                // fallback for old one
                return this.join(' - ');
            };

            if (typeof prop === 'function') {
                var in_name = false,
                    in_specific_test = (_name.toString() === opt.testFullSpec) ? true : false;
                for (var i = 0; i < _name.length; i += 1) {
                    if (_name[i] === opt.testspec) {
                        in_name = true;
                    }
                }

                if ((!opt.testFullSpec || in_specific_test) && (!opt.testspec || in_name)) {
                    if (opt.moduleStart) {
                        opt.moduleStart();
                    }
                    nodeunitcore.runTest(_name, suite[k], opt, cb);
                }
                else {
                    return cb();
                }
            }
            else {
                nodeunitcore.runSuite(_name, suite[k], opt, cb);
            }
        }, callback);
    };

    for (var k in nodeunitcore) {
        nodeunit[k] = nodeunitcore[k];
    };

};