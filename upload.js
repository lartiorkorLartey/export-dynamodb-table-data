const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const dotenv = require('dotenv')
const fs = require('fs');

dotenv.config()

// AWS.config.update({
//     region: process.env.AWS_REGION,
//     access_key: process.env.AWS_ACCESS_KEY_ID_2,
//     secret_access_key: process.env.AWS_SECRET_ACCESS_KEY_2
// });

const ddb = new AWS.DynamoDB({
    region: process.env.AWS_REGION,
    access_key: process.env.AWS_ACCESS_KEY_ID,
    secret_access_key: process.env.AWS_SECRET_ACCESS_KEY
});

// Function to create a DynamoDB table
async function createTable(tableName) {
    const params = {
        TableName: tableName,
        AttributeDefinitions: [
            {
                AttributeName: "sk",
                AttributeType: "S",
            },
            {
                AttributeName: "pk",
                AttributeType: "S",
            },
        ],
        KeySchema: [
            {
                AttributeName: "pk",
                KeyType: "HASH",
            },
            {
                AttributeName: "sk",
                KeyType: "RANGE",
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 10
        }
    };

    try {
        await ddb.createTable(params).promise();
        console.log(`Table ${tableName} created successfully.`);
    } catch (err) {
        console.error(`Error creating table: ${err}`);
    }
}

// Function to populate the table with data from a JSON file
async function populateTable(tableName, jsonData) {
    const params = {
        RequestItems: {
            [tableName]: jsonData.map(item => {
                const record = {};

                for (const [key, value] of Object.entries(item)) {
                    record[key] = {};

                    if (typeof value === "object") {
                        if (Array.isArray(value)) {
                            record[key][getAttributeType(value)] = value.map((entry) => {
                                return getAttributeValue(entry);
                            });
                            continue;
                        }

                        record[key][getAttributeType(value)] = getAttributeValue(value);
                        continue;
                    }

                    if (typeof value === "boolean") {
                        record[key][getAttributeType(value)] = value;
                        continue;
                    }

                    record[key][getAttributeType(value)] = `${value}`;
                }

                return {
                    PutRequest: {
                        Item: record
                    }
                };
            })
        }
    };

    try {
        await ddb.batchWriteItem(params).promise();
        console.log(`Table ${tableName} populated successfully.`);
    } catch (err) {
        console.log(err);
        console.error(`Error populating table: ${err}`);
    }
}

// Read data from the JSON file
const jsonData = JSON.parse(fs.readFileSync('dynamodb_export.json'));

// Create the table and populate it
const tableName = process.env.REMOTE_DB_TABLE_NAME;

createTable(tableName).then(() => {
    return setTimeout(async () => {
        let index = 0;
        let step = 20;

        console.log(`Total items: ${jsonData.length}`);
        while (index < jsonData.length) {
            await populateTable(tableName, jsonData.slice(index, index + step))
            console.log(`Populated Table with Item: ${index + 1} - ${index + step + 1}`)

            if ((index + step) > jsonData.lenght) {
                let remainders = jsonData.lenght - index;
                index += remainders;
                continue;
            }

            index += step;
        }
    }, 2000)
})
    .catch(err => console.error('Error:', err));

function getAttributeValue(rawValue) {
    let attributeValue = {}

    if (typeof rawValue === "object") {
        let attrType = getAttributeType(rawValue);

        if (Array.isArray(rawValue)) {
            if (attrType == "NS" || attrType == "SS") {
                attributeValue[attrType] = rawValue ?? [""];
                return attributeValue;
            }
        }

        attributeValue[attrType] = {}
        for (const [key, value] of Object.entries(rawValue)) {
            attributeValue[attrType][key] = {}
            attributeValue[attrType][key][getAttributeType(value)] = getAttributeValue(value)
        }

        return attributeValue;
    }

    if (typeof rawValue == "boolean") {
        return rawValue;
    }

    return `${rawValue}`;
}

function getAttributeType(value) {
    switch (typeof value) {
        case "number": return "N";
        case "boolean": return "BOOL";
        case "object":
            if (Array.isArray(value)) {
                if (typeof value[0] === "object") {
                    return "L";
                }

                if (typeof value[0] === "number") {
                    return "NS";
                }

                return "SS";
            }

            return "M";
        default: return "S";
    }
}

async function logger(error) {
    const errorLog = {
        timestamp: new Date().toISOString(),
        tableName: tableName,
        error: error.message,
        stack: error.stack
    };
    await fs.writeFile("error.log", JSON.stringify(errorLog, null, 2))
}
