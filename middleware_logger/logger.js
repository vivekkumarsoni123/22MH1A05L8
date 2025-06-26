// logger.js
const axios = require('axios');

const LOG_API_URL = "http://20.244.56.144/evaluation-service/logs";

/**
 * Reusable logging function
 */
async function Log(stack, level, packageName, message) {
    try {
        const requestBody = {
            stack: stack.toLowerCase(),
            level: level.toLowerCase(),
            package: packageName.toLowerCase(),
            message
        };

        const response = await axios.post(LOG_API_URL, requestBody);
        console.log("Log created:", response.data);
    } catch (error) {
        console.error("Failed to create log:", error.message);
    }
}

module.exports = Log;
