"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ioredis_1 = require("ioredis");
var dotenv = require("dotenv");
// Load environment variables
dotenv.config();
var redisHost = process.env.REDIS_HOST || '10.98.196.107';
var redisPort = parseInt(process.env.REDIS_PORT || '6379');
console.log("Attempting to connect to Redis at ".concat(redisHost, ":").concat(redisPort));
var redis = new ioredis_1.default({
    host: redisHost,
    port: redisPort,
    retryStrategy: function (times) {
        var delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
});
redis.on('connect', function () {
    console.log('Successfully connected to Redis');
    redis.quit();
    process.exit(0);
});
redis.on('error', function (err) {
    console.error('Failed to connect to Redis:', err);
    process.exit(1);
});
// Set a timeout to prevent hanging
setTimeout(function () {
    console.error('Connection attempt timed out');
    process.exit(1);
}, 15000);
