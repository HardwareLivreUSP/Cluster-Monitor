const net = require('net');
const server = net.createServer( function (c) {
  // 'connection' listener
  console.log('client connected');
  c.on('end', function () {
    console.log('client disconnected');
  });
  c.write('hello\r\n');
  c.pipe(c);
});

server.on('error',  function (err) {
  throw err;
});

server.listen(7001, function () {
  console.log('server bound');
});