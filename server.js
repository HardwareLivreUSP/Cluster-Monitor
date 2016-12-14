const net = require('net');
const server = net.createServer( function (client) {
const spawn = require('child_process').spawn;
  // 'connection' listener
  console.log('client connected');

    client.on('end', function () {
        console.log('client disconnected');
    });

    client.on('data', function (data) {
        var string = data.toString();
        client.end();
        openssl = spawn('openssl', ['rsautl', '-decrypt', '-inkey', 'server_private_key.pem']);
        openssl.stdin.write(data);
        openssl.stdin.end();
        openssl.stdout.on('data', function (data) {
            console.log(data);
        });
    });

});

server.on('error',  function (err) {
    throw err;
});

server.listen(7001, function () {
    console.log('server bound');
});