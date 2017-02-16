#!/bin/bash

SERVER=cluster.capella.pro
USER=harduime

if [ ! -d ./keys ]; then
  mkdir ./keys
fi

if [ ! -f keys/private_key.pem ]; then
  openssl genrsa -out keys/private.pem 2048 2> /dev/null
fi

if [ ! -f keys/public_key.pem ]; then
  openssl rsa -in keys/private.pem -out keys/public.pem -outform PEM -pubout 2> /dev/null
fi

mkdir cluster_install_client
cp keys/public.pem cluster_install_client/server.pem
cp client/* cluster_install_client/
tar -cvf install.tar cluster_install_client/ 2> /dev/null
rm -rf cluster_install_client/ > /dev/null

while read -u10 HOST; do echo "-------------" $HOST; done 10< hosts

rm install.tar
cd server
npm install
