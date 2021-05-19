const logger = require("./logger");
// const { response } = require("../app");

const errorHandler = (error, request, response, next) => {
  logger.error(error.messsage);
  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

module.exports = {
  errorHandler,
  unknownEndpoint,
  requestLogger,
};
