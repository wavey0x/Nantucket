require("dotenv").config();

const { Pool } = require("pg");
global.pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

const Web3 = require("web3");
if (process.env.WEB3_PROVIDER_TEST.endsWith(".ipc")) {
  net = require("net");
  global.web3 = new Web3(process.env.WEB3_PROVIDER_TEST, net);
} else {
  global.web3 = new Web3(process.env.WEB3_PROVIDER_TEST);
}

const winston = require("winston");
const SlackHook = require("../src/logging/slackhook");

winston.configure({
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console({ handleExceptions: true }),
    new SlackHook({
      level: "info",
      webhookUrl: process.env.SLACK_WEBHOOK,
      mrkdwn: true
    })
  ],
  exitOnError: false
});

after(() => {
  try {
    web3.currentProvider.connection.close();
  } catch {
    web3.currentProvider.connection.destroy();
  } finally {
    pool.end();
  }
});
