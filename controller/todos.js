const todoRouter = require("express").Router();
const logger = require("../utils/logger");
const Todo = require("../models/todo");

todoRouter.get("/", async (request, response) => {
  try {
    const todos = await Todo.find({});
    response.json(todos);
    // response.json(todos.map((todo) => todo.toJSON()));
  } catch (err) {
    response.status(400).end();
  }
});

todoRouter.get("/:id", async (request, response, next) => {
  try {
    const todo = await Todo.findById(request.params.id);
    console.log(todo);
    if (todo) {
      response.json(todo);
    } else {
      response.status(404).end();
    }
  } catch (exception) {
    next(exception);
  }
});

todoRouter.post("/", async (request, response) => {
  logger.info(request.body);
  try {
    const body = request.body;
    const todo = new Todo({
      todo: body.todo,
      status: body.status,
    });
    await todo.save();
    response.send(todo);
  } catch (err) {
    response.status(400).end();
  }
});

todoRouter.delete("/:id", async (request, response, next) => {
  try {
    await Todo.findByIdAndRemove(request.params.id);
    response.status(204).end();
  } catch (err) {
    next(err);
  }
});

// todoRouter.delete("/:id", (request, response, next) => {
//   Todo.findByIdAndRemove(request.params.id)
//     .then(() => {
//       response.status(204).end();
//     })
//     .catch((error) => next(error));
// });

module.exports = todoRouter;
