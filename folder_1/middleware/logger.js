const axios = require('axios');

const LOG_API_URL = "http://20.244.56.144/evaluation-service/logs"; // Update to mock if needed

const validStacks = ["backend", "frontend"];
const validLevels = ["debug", "info", "warn", "error", "fatal"];
const validPackages = {
  backend: ["cache", "controller", "cron_job", "db", "domain", "handler", "repository", "route", "service"],
  frontend: ["api", "component", "hook", "page", "state", "style"],
  common: ["auth", "config", "middleware", "utils"]
};

async function Log(stack, level, packageName, message) {
  stack = stack.toLowerCase();
  level = level.toLowerCase();
  packageName = packageName.toLowerCase();

  if (!validStacks.includes(stack)) {
    console.error(`Invalid stack: ${stack}`);
    return;
  }

  if (!validLevels.includes(level)) {
    console.error(`Invalid level: ${level}`);
    return;
  }

  const isValidPackage =
    validPackages.common.includes(packageName) ||
    validPackages[stack].includes(packageName);

  if (!isValidPackage) {
    console.error(`Invalid package '${packageName}' for stack '${stack}'`);
    return;
  }

  try {
    const response = await axios.post(LOG_API_URL, {
      stack,
      level,
      package: packageName,
      message
    });
    console.log("Log created:", response.data);
  } catch (err) {
    console.error("Failed to create log:", err.response?.status, err.response?.data || err.message);
  }
}

module.exports = Log;
