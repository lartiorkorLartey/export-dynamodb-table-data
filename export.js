const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const dotenv = require('dotenv')

dotenv.config()

AWS.config.update({
    region: process.env.AWS_REGION,
    access_key: process.env.AWS_ACCESS_KEY_ID,
    secret_access_key: process.env.AWS_SECRET_ACCESS_KEY
});

async function queryDynamoDB(tableName) {
  const dynamodb = new AWS.DynamoDB.DocumentClient({
    endpoint: process.env.ENDPOINT
  });

  let items = [];
  let lastEvaluatedKey;

  do {
    const params = {
      TableName: tableName,
      ExclusiveStartKey: lastEvaluatedKey
    };

    const data = await dynamodb.scan(params).promise();
    items = items.concat(data.Items);
    lastEvaluatedKey = data.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return items;
}

async function exportToJSON(items, outputFile) {
  const fs = require('fs');

  fs.writeFileSync(outputFile, JSON.stringify(items, null, 2));
}

const tableName = process.env.LOCAL_DB_TABLE_NAME;

queryDynamoDB(tableName)
  .then(items => exportToJSON(items, 'dynamodb_export.json'))
  .catch(err => console.error('Error:', err));
  