const net = require('net');
const server = net.createServer( function (client) {
  // 'connection' listener
  console.log('client connected');

    client.on('end', function () {
        console.log('client disconnected');
    });

    client.on('data', function (data) {
        console.log(data.toString());
        client.end();
    });

});

server.on('error',  function (err) {
    throw err;
});

server.listen(7001, function () {
    console.log('server bound');
});