const express = require("express");
const app = express();

const cors = require("cors");
const mongoose = require("mongoose");
const config = require("./utils/config");
const logger = require("./utils/logger");
const todoRouter = require("./controller/todos");
const middleware = require("./utils/middleware");

logger.info("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((result) => {
    logger.info("Connected to MongoDb");
  })
  .catch((error) => {
    logger.error("Error connected to Mongose", error.message);
  });

app.use(cors());
app.use(express.json());

app.use("/api/pom", todoRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;