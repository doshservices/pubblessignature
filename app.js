const conn = require('./src/db/mongoose');
(function connect() {
    console.log(conn)
    console.log("type of conn", typeof conn)
    conn()
})()