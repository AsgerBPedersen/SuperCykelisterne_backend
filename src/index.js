const cookieParser = require('cookie-parser')
const createServer = require('./createServer');
const jwt = require('jsonwebtoken');
const db = require('./db');

const server = createServer();

//cookie middleware
server.express.use(cookieParser())

server.express.use((req, res, next) => {
    const { token } = req.cookies;
    if(token) {

        const { userId } = jwt.verify(token, "SuperSecretKey");

        req.userId = userId;
    }
    next();
})

server.start({
    cors: {
        credentials: true,
        origin: "http://localhost:3001",
    }
},
    deets => {
        console.log(`Server is now running on port http:/localhost:${deets.port}`);
    }
)