var WebSocketServer = require('websocket').server;
var http = require('http');
//require the express nodejs module
var express = require('express');
//set an instance of exress
var app = express();

var viewImageResponseObject;
var firstFrameHeaderSent = false;
var getRequestTriggered = false;
var requestObject;

/*
 *   start server
 */
var server = app.listen(8081, function() {
    var host = server.address().address
    var port = server.address().port
    console.log("Node Js app listening at http://" + host + port);
});

//-- serves static files
app.use('/', express.static("html"));

app.get('/viewImage', function(request, response) {
    console.log("Request received from : /viewImage");
    response.setHeader("content-Type", "multipart/x-mixed-replace; boundary=frameFRAMEframe\r\n\r\n");
    // response.writeHead(200, {
    //     'Connection': 'Close',
    //     'Expires': '-1',
    //     'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0, false',
    //     'Pragma': 'no-cache',
    //     'Content-Type': 'multipart/x-mixed-replace; boundary=frameFRAMEframe'
    // });
    response.useChunkedEncodingByDefault = false;
    getRequestTriggered = true;
    requestObject = response;
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});
var clients = [];
wsServer.on('request', function(request) {


    var connection = request.accept('', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    if (request.origin == "http://rcteer.swastibhat.com")
        clients.push(connection);
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            // console.log('1-Received Message: ' + message.utf8Data);
            //requestObject.write("--frame\r\n");
            for (var i = 0; i < clients.length; i++) {
                clients[i].sendUTF(message.utf8Data);
            }

            connection.sendUTF("text received");
        } else if (message.type === 'binary') {
            //console.log('2-Received Binary Message of ' + message.binaryData.length + ' bytes');
            console.log(message.binaryData);

            for (var i = 0; i < clients.length; i++) {
                clients[i].sendBytes(message.binaryData);
            }

        } else {
            console.log("3-Received some data = " + message)
        }


    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});