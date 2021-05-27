const todoRouter = require("express").Router();
const logger = require("../utils/logger");
const Todo = require("../models/todo");
const User = require("../models/user");

todoRouter.get("/", async (request, response) => {
  try {
    const todos = await Todo.find({}).populate("user", {
      username: 1,
      name: 1,
    });
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

    const user = await User.findById(body.userId);
    console.log(user);

    const todo = new Todo({
      todo: body.todo,
      status: body.status,
      user: user._id,
    });

    const savedTodo = await todo.save();
    user.todos = user.todos.concat(savedTodo._id);
    await user.save();
    response.json(savedTodo);
  } catch (err) {
    response.status(400).end();
  }
});

// refactored with express-async-errors library
todoRouter.delete("/:id", async (request, response, next) => {
  await Todo.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

// todoRouter.delete("/:id", (request, response, next) => {
//   Todo.findByIdAndRemove(request.params.id)
//     .then(() => {
//       response.status(204).end();
//     })
//     .catch((error) => next(error));
// });

module.exports = todoRouter;
