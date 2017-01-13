# Servidor

Criei um servidor em node js para poder realizar o monitoramento do cluster.

Esse servidor deve ter acesso a placa principal. Para isso a chave publica desse servidor deve estar em ~/.ssh/authorized_keys de algum elemento do cluster. 

### No IME

Para conseguir acessar a placa dentro da rede local remotamente utilizamos a seguinte configuração ssh 

```
Host linux
    HostName linux.ime.usp.br
    User capella

Host cluster
    HostName 192.168.49.10
    ProxyJump linux
    User harduime
```

OpenSSH_7.3p1, OpenSSL 1.0.2j  26 Sep 2016