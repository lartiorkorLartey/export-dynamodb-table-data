const upload= require("./upload.js")
const exportData= require("./export.js")
const dotenv = require('dotenv')
dotenv.config();
(
    async ()=>{
        // // export old dynamodb table data to JSON file
        await exportData.exportDynamoDBToJSON()


        // create dynamodb table if it doesn't exist
        const tableExist= await upload.doesTableExist(process.env.NEW_DB_TABLE_NAME)
        if(!tableExist){
            await upload.createTable(process.env.NEW_DB_TABLE_NAME)
        }

        // upload data to new table
        await upload.uploadData(process.env.NEW_DB_TABLE_NAME)

    }
)()