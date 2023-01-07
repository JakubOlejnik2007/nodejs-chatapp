const dotenv = require('dotenv');

dotenv.config();
const {PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, PRIVATE} = process.env;
module.exports = {
    port: PORT,
    mysql: {
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        name: DB_NAME
    },
    private: PRIVATE
}