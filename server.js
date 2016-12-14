var net = require('net');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var spawn = require('child_process').spawn;

const server = net.createServer( function (client) {
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
            console.log("> recebido de "+res[0]);
        });

        openssl.stderr.on('data', function (data){
            console.log(`stderr: ${data}`);
        });

        openssl.stdin.write(data);
        openssl.stdin.end();
    });

});

server.on('error',  function (err) {
    throw err;
});

server.listen(7001, function () {
    console.log('server bound');
});

server.listen(8002);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
