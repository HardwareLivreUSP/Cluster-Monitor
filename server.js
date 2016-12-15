var net = require('net');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var spawn = require('child_process').spawn;

app.use(express.static('static'))

const server_cluster = net.createServer( function (client) {
    // 'connection' listener
    //console.log('client connected');

    client.on('end', function () {
        // console.log('client disconnected');
    });

    client.on('data', function (data) {
        var string = data.toString();
        client.end();
        openssl = spawn('openssl', ['rsautl', '-decrypt', '-inkey', 'server_private_key.pem']);

        openssl.stdout.on('data', function (data) {
            var str = data.toString();
            var res = str.split('\n');
            io.emit('info', { cpu: res[0], v: res[1].split(' ') });
            console.log("> recebido de "+res[0]);
        });

        openssl.stderr.on('data', function (data){
            console.log(`stderr: ${data}`);
        });

        openssl.stdin.write(data);
        openssl.stdin.end();
    });

});

server_cluster .on('error',  function (err) {
    throw err;
});

server_cluster.listen(7001, function () {
    console.log('server bound');
});

server.listen(8002);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/static/index.html');
});

io.on('connection', function (socket) {
  socket.emit('pcs', ["ig1", "ig2"]);
});
