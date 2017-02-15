#!/bin/bash

SERVER=cluster.capella.pro

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

while read -u10 host; do
  echo "-------------" $host;
  ssh-copy-id harduime@$host   2> /dev/null;
  scp install.tar $host:~/  2> /dev/null > /dev/null;
  ssh -t $host "\
  	tar -xvf install.tar > /dev/null 2> /dev/null && \
  	cd cluster_install_client/ && \
  	chmod 777 client_install && \
  	sudo sh client_install $host $SERVER && \
  	cd && \
  	rm -rf install.tar cluster_install_client/ &&\
    cat /etc/clustermonitor/public_key.pem > $host.pem \
  " 2> /dev/null;
  scp $host:~/$host.pem  ./keys/ 2> /dev/null > /dev/null;
done 10< hosts

rm install.tar
cd server
npm install
