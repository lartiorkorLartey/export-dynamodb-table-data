const AWS = require('aws-sdk');
const dotenv= require('dotenv');
const fs = require('fs');
dotenv.config();


async function retrieveData() {
    let params = {
        TableName: sourceTable,
    };

    let allData = [];
    let count=1
    try {
        do {
            const data = await dynamoDB.scan(params).promise();
            allData = allData.concat(data.Items);
            console.log(count)
            count++
            params.ExclusiveStartKey = data.LastEvaluatedKey;
        } while (params.ExclusiveStartKey);

        fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));
        console.log("Data retrieved successfully. Saved to:", outputFile);
    } catch (error) {
        console.error("Error retrieving data:", error);
    }
}


module.export= {retrieveData}