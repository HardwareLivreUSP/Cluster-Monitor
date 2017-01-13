var net = require('net');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var spawn = require('child_process').spawn;
var Upload = require('upload-file');


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
        openssl = spawn('openssl', ['rsautl', '-decrypt', '-inkey', '../keys/server_private_key.pem']);

        openssl.stdout.on('data', function (data) {
            var str = data.toString();
            var res = str.split('\n');
            var values = res[1].split(' ');

            for (var i = 0, len = values.length; i < len; i++) {
                values[i] = parseInt(values[i], 10); 
            }
            values.splice(1, 1);
            io.emit('info', { cpu: res[0], v: values });
            console.log("> recebido de "+res[0]);
        });

        openssl.stderr.on('data', function (data){
            console.log(`stderr: ${data}`);
        });

        openssl.stdin.write(data);
        openssl.stdin.end();
    });

});

server_cluster.on('error',  function (err) {
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
});

io.on('init', function (socket) {
  socket.emit('pcs', ["ig1", "ig2", "ig3", "ig4", "ig5", "ig6", "ig7", "ig8", "ig9", "ig10"]);
});

app.post('/upload', function(req, res) {
  var upload = new Upload({
    dest: './files',
    maxFileSize: 100 * 1024,
    acceptFileTypes: /(\.|\/)(c|mpi)$/i,
    rename: function(name, file) {
      console.log(this.fields);
      return file.filename;
    }
  });
 
  upload.on('end', function(fields, files) {
    if (!fields.channel) {
      this.cleanup();
      this.error('Channel can not be empty');
      return;
    }
    res.send('ok')
  });
 
  upload.on('error', function(err) {
    res.send(err);
  });
 
  upload.parse(req);
});
