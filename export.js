const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const dotenv = require('dotenv')
const fs= require("fs")

dotenv.config()

const dynamoDB = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const oldTable = process.env.OLD_DB_TABLE_NAME;
const outputFile = "dynamodb_export.json";

async function exportDynamoDBToJSON() {
   let params = {
          TableName: oldTable,
      };
  
      let allData = [];
      let count=1
      try {
          do {
              const data = await dynamoDB.scan(params).promise();
              allData = allData.concat(data.Items);
              console.log(`Batch ${count}: ${data.Items.length} items`)
              count++
              params.ExclusiveStartKey = data.LastEvaluatedKey;
          } while (params.ExclusiveStartKey);
  
          fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));
          console.log("Data retrieved successfully. Saved to:", outputFile);
      } catch (error) {
          console.error("Error retrieving data:", error);
      }
}


module.exports= {exportDynamoDBToJSON}
  