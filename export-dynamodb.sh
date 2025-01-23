#!/bin/bash

# Configuration
REMOTE_JS_FILE="migrate.js"
LOCAL_TABLE_NAME="LocalTableName"
RESPONSE_FILE="dynamodb_export.json"

# Step 1: Run the JavaScript file to retrieve data from remote DynamoDB
echo "Retrieving data from remote DynamoDB..."
node "$REMOTE_JS_FILE"

if [ $? -ne 0 ]; then
    echo "Error: Failed to run $REMOTE_JS_FILE."
    exit 1
fi

# Check if response file exists
if [ ! -f "$RESPONSE_FILE" ]; then
    echo "Error: Response file $RESPONSE_FILE not found."
    exit 1
fi

echo "Data retrieved successfully and stored in $RESPONSE_FILE."

# Step 2: Export data to local DynamoDB
echo "Exporting data to local DynamoDB table: $LOCAL_TABLE_NAME..."
# while IFS= read -r line; do
#     ITEM=$(echo "$line" | jq -c .)
#     aws dynamodb put-item \
#         --table-name "$LOCAL_TABLE_NAME" \
#         --item "$ITEM" \
#         --endpoint-url http://localhost:8000

#     if [ $? -ne 0 ]; then
#         echo "Error: Failed to insert item into $LOCAL_TABLE_NAME."
#         exit 1
#     fi
# done < <(jq -c '.[]' "$RESPONSE_FILE")

echo "Data export to local DynamoDB completed successfully."
