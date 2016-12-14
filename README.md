# Cluster-Monitor


## Server
You will need to create a public/private key. We will use openssl to do this.
The frt ting to do is meke tour private key. Gor thins run:

openssl genrsa -out server_private_key.pem 1024

From the private key we can then generate public key

openssl rsa -in server_private_key.pem -out server_public_key.pem -outform PEM -pubout