rm -rf /etc/clustermonitor
rm -rf /usr/sbin/cclient
rm -rf /etc/init.d/clustermonitor
mkdir /etc/clustermonitor
chmod u+x clustermonitor*
mv cclient /usr/sbin/
mv clustermonitor /etc/init.d/
cp ../keys/server_public_key.pem /etc/clustermonitor/