#!/bin/bash
echo $(date)" Starting Script" 
while true  
        do
        (echo ig1; cat /proc/stat | grep cpu) | openssl rsautl -encrypt -inkey server_public_key.pem -pubin | nc cluster.capella.pro 7001
        sleep 1
done  
