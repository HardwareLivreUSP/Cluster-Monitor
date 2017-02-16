var net = require('net');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var spawn = require('child_process').spawn;
upload = require('jquery-file-upload-middleware');
var spawn = require('child_process').spawn;
var fs = require('fs');

var queue = [];


app.use(express.static('static'))

const server_cluster = net.createServer(function(client) {
    // 'connection' listener
    //console.log('client connected');

    client.on('end', function() {
        // console.log('client disconnected');
    });

    client.on('data', function(data) {
        var string = data.toString();
        client.end();
        openssl = spawn('./decode', []);

        openssl.stdout.on('data', function(data) {
            var str = data.toString();
            var res = str.split('\n');
            var values = res[1].split(' ');

            for (var i = 0, len = values.length; i < len; i++) {
                values[i] = parseInt(values[i], 10);
            }
            values.splice(1, 1);
            io.emit('info', {
                cpu: res[0],
                v: values
            });
            //console.log("> recebido de " + res[0]);
        });

        openssl.stderr.on('data', function(data) {
            console.log(`stderr: ${data}`);
        });

        openssl.stdin.write(data);
        openssl.stdin.end();
    });

});

server_cluster.on('error', function(err) {
    throw err;
});

function readLines(input, func) {
  var remaining = '';

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      func(line);
      index = remaining.indexOf('\n');
    }
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      func(remaining.split('\n'));
    }
  });
}

server_cluster.listen(7001, function() {
    //console.log('server bound');
});

server.listen(8002);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/static/index.html');
});

io.on('connection', function(socket) {
    var input = fs.createReadStream('../hosts');
    readLines(input, function(data){
        console.log(data);
        socket.emit('pcs', data);
    });
});

upload.configure({
    uploadDir: __dirname + '/files/',
    uploadUrl: '/uploads',
    acceptFileTypes: /\.c$/i
});

app.use('/upload', upload.fileHandler());


/// Redirect all to home except post
app.get('/upload', function(req, res) {
    res.redirect('/');
});

app.put('/upload', function(req, res) {
    res.redirect('/');
});

app.delete('/upload', function(req, res) {
    res.redirect('/');
});

upload.on('end', function(fileInfo, req, res) {
    queue.push(fileInfo);
    run_next ();
});

var r = true;
function run_next ()  {
    if (r && queue.length > 0) {
        r = false;
        var fname = queue.shift().name;
        io.emit('log', {
            msg: "--------------------------------------------\nIniciando processo do arquivo " + fname
        });
        io.emit('log', {
            msg: "Enviando arquivo para cluster."
        });
        fs.createReadStream('files/' + fname).pipe(fs.createWriteStream('files/p.c'));

        spawn('scp', ['files/p.c', 'cluster:~/']).on('close', (code) => {
            if (code == 0) {
                io.emit('log', {
                    msg: "Arquivo enviado."
                });
                io.emit('log', {
                    msg: "Copilando."
                });
                spawn('ssh', ['cluster', 'mpicc', 'p.c', '-o', 'prog']).on('close', (code) => {
                    if (code == 0) {
                        io.emit('log', {
                            msg: "Copiando para cada cada unidade (demora)."
                        });
                        spawn('ssh', ['cluster', '~/.scripts/toall', 'prog']).on('close', (code) => {
                            if (code == 0) {
                                io.emit('log', {
                                    msg: "Copiado!. Executando programa."
                                });

                                var programa = spawn('ssh', ['cluster', 'mpirun', '--host', 'ig1,ig2,ig3,ig4,ig5,ig6,ig7,ig8,ig9,ig10', 'prog'])
                                programa.on('close', (code) => {
                                    if (code == 0) {
                                        io.emit('log', {
                                            msg: "Finalizado com sucesso!."
                                        });
                                    } else {
                                        io.emit('log', {
                                            msg: "Erro ao executar programa."
                                        });
                                    }
                                });
                                programa.stdout.on('data', (saida) => {
                                    io.emit('log', {
                                        msg: saida.toString()
                                    });
                                });
                            } else {
                                io.emit('log', {
                                    msg: "Erro ao copiar para todos."
                                });
                            }
                            run_next ();
                        });
                    } else {
                        io.emit('log', {
                            msg: "Erro ao copilar."
                        });
                    }
                });
            }
        });
    } else r = true;
}