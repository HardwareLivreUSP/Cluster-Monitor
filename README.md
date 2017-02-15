# Cluster-Monitor

Para instalar esse sistema de monitoramento primeiramente você de executar o arquivo listar em host o endereço de cada placa. Depois execute o arquivo 'install.sh'.

## História

Esse repositório foi criado para facilitar o controle de um cluster de várias máquina rodando Debian. Foi feito pelo grupo para controlar um cluster formada por várias placas Intel Galileo Gen2 (as quais foram doadas da intel para o grupo).

## Server
You will need to create a public/private key. We will use openssl to do this.
The frt ting to do is meke tour private key. Gor thins run:

openssl genrsa -out server_private_key.pem 2048

From the private key we can then generate public key

openssl rsa -in server_private_key.pem -out server_public_key.pem -outform PEM -pubout