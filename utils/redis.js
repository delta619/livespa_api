const { createClient } = require('redis');


const Redis_DB = createClient({
  url: process.env.REDIS_URL,

});


Redis_DB.on('error', (err) => {
  console.error('Redis Client Error', err);
});

Redis_DB.on('connect', () => {
  console.log('Redis client connected');
});

Redis_DB.on('end', () => {
  console.log('Redis client disconnected');
});
async function connectRedis() {
  if (!Redis_DB.isOpen) {
    await Redis_DB.connect();
    console.log('Redis client connected');
  }
}

module.exports = { Redis_DB, connectRedis };
