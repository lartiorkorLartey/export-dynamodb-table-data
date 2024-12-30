#!/bin/bash

# node export.js
# unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN
# node upload.js



# Execute the first script with the first account's credentials
aws sts assume-role --role-arn arn:aws:iam::23094267074:user/<user> --role-session-name MySession | jq '.Credentials' > credentials.json
source <(jq -r '.AccessKeyId,.SecretAccessKey,.SessionToken' credentials.json)
node export.js

# Clear credentials or assume a different role
unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN

# Execute the second script with the second account's credentials
aws sts assume-role --role-arn arn:aws:iam::23095557074:role/<user> --role-session-name MySession | jq '.Credentials' > credentials.json
source <(jq -r '.AccessKeyId,.SecretAccessKey,.SessionToken' credentials.json)
node upload.js
