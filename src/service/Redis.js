const redis = require("redis");
const { promisify } = require("util");
const { HEROKU_REDIS_CHARCOAL_URL, OTP_DURATION } = require("../core/config");

const redisClient = redis.createClient(HEROKU_REDIS_CHARCOAL_URL);
const getAsync = promisify(redisClient.get).bind(redisClient);

exports.cacheData = (key, value, expirationTime = OTP_DURATION) => {
  redisClient.setex(key, expirationTime, value);
};

exports.getCachedData = async (key) => {
  return await getAsync(key);
};
