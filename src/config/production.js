const { connect } = require('mongoose');
const { MONGODB_URI } = require('../core/config');
const { logger } = require('../utils/logger');
const { throwError } = require('../utils/handleErrors');
const app = require('../../server')
const { PORT } = require('../core/config');

module.exports = async () => {
    try {
      const connection = await connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      });

      if (!connection) {
        console.log("no connection")
        throwError('Unable to connect to database', 500);
      }

      logger.info('Database connection successful!');
      app.listen(PORT, () => logger.info(`Booking Backend Service Started on port ${PORT}`));
    } catch (err) {
      console.log(err)
      logger.error('Database connection failed!');
    }
}