const todoRouter = require("express").Router();
const logger = require("../utils/logger");
const Todo = require("../models/todo");

todoRouter.get("/", async (request, response, next) => {
  const todos = await Todo.find({});
  response.json(todos);
});

todoRouter.post("/", async (request, response) => {
  logger.info(request.body);
  const body = request.body;
  const todo = new Todo({
    todo: body.todo,
    status: body.status,
  });
  await todo.save();
  response.send(todo);
});

todoRouter.delete("/:id", async (request, response) => {
  await Todo.findByIdAndRemove(request.params.id);
  console.log(response.status);
});

module.exports = todoRouter;
