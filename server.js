var http = require('http');
var message = 'Hello world';
var writemessage = function (aMessage){
        var port = process.env.port || 1337;
        http.createServer(function (req, res) {
            var reporter = require('./generichtml');
            var altConsole = {
                    _data: '',
                    log: function(data){
                            this._data = this._data + data +'\n';
                        }
                };
            reporter.run(['test.js'],{}, function (failures){
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(altConsole._data);
                },altConsole);
        }).listen(port);
    };

    writemessage("We're testing NodeUnit");
/*var azure = require('azure');
var blobService = azure.createBlobService('cadxtest','QsNQZsLr3myrNRb6VkspTQhLES3OtXYZllhNGMIhy2bo/8TA9yvcbpeh5AsHfIE2pMGs0VuK1bMIfawqCiSLvQ==');
var postToSend = JSON.stringify({"Model":{"Id":"6cccc0cf-d5f1-4eb8-9924-4f58afccb80d"}});
var postOptions =
    {
        host: 'devapp.poweredbycadworx.com',
        path: '/File/Store/Download',
        method: 'POST'
    };

var buffer = new Buffer([]);
var storeData = function ()
{
    blobService.createContainerIfNotExists('testtest', function(error){
        if(!error){
            // Container exists and is private
            message = 'Damn you world';
            var streamifier = require('streamifier');
            var memstream = streamifier.createReadStream(buffer);
            blobService.createBlockBlobFromStream('testtest', 'testblob', memstream, buffer.length, null, function(bloberror)
                {
                    message = 'Pretty world';
                    writemessage(message);
                });
        }
        else
        {
            writemessage(message);
        }

    });
};

var retrieveData = function ()
{
var fs=require('fs');
blobService.getBlobToStream('testtest'
    , 'testblob'
    , fs.createWriteStream('output.cdr')
    , function(error){
        if(!error){
            // Wrote blob to stream
                    message = 'More than worlds';
                    writemessage(message);
        }
    });
};

var compareData = function(){
        var crypto = require('crypto');
        var shasum = crypto.createHash('sha256');
        shasum.update(buffer);
        var readDigest = shasum.digest('hex');
        var othershasum = crypto.createHash('sha256');
        othershasum.setEncoding('hex');
        blobService.getBlobToStream('testtest'
            , 'testblob'
            , othershasum
            , function(error){
                if(!error){
                    // Wrote blob to stream
                    var blobDigest = othershasum.read();
                    message = 'More than worlds\n' + readDigest + '\n' + blobDigest;
                    writemessage(message);
                }
            });
    }
var req = http.request(postOptions, function (response)
    {
        response.on('data', function (chunk) {
            var length = chunk.length;
            buffer = Buffer.concat([buffer, chunk]);
        });

        response.on('end', function (chunk) {
            compareData();
        });
    });
req.write(postToSend);
req.end();



*/