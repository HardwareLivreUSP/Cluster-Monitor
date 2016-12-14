(echo gl1; cat /proc/stat | grep cpu) | openssl rsautl -encrypt -inkey server_public_key.pem -pubin | openssl enc -base64 | nc cluster.capella.pro 7001

(echo gl1; cat /proc/stat | grep cpu) | openssl rsautl -encrypt -inkey server_public_key.pem -pubin | nc cluster.capella.pro 7001