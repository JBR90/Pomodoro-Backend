const todoRouter = require("express").Router();
const logger = require("../utils/logger");
const Todo = require("../models/todo");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

todoRouter.get("/", async (request, response) => {
  try {
    const todos = await Todo.find({}).populate("user", {
      username: 1,
      name: 1,
    });
    console.log(todos);
    const token = request.token;
    console.log("token", token);
    const decodedToken = jwt.verify(token, process.env.SECRET);
    console.log("decodedToten", decodedToken);
    // if (!token || !decodedToken.id) {
    //   return response.status(401).json({ error: "token mising or invalid" });
    // }

    const userTodos = todos.filter((todo) => todo.user.id === decodedToken.id);
    console.log("USER TODOS", userTodos);
    if (userTodos) {
      response.json(userTodos);
    } else {
      response.json(todos);
    }
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

const getTokenFrom = (request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7);
  }
  return null;
};

todoRouter.post("/", async (request, response) => {
  try {
    const body = request.body;
    console.log("reqest token", request.token);
    let token = request.token;
    console.log("token from helper", token);
    const decodedToken = jwt.verify(token, process.env.SECRET);
    console.log("decoded token", decodedToken);
    if (!token || !decodedToken.id) {
      console.log("not found");
      return response.status(401).json({ error: "token mising or invalid" });
    }
    const user = await User.findById(decodedToken.id);

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

todoRouter.put("/:id", async (request, response, next) => {
  // const { body } = request;
  const id = request.params.id.toString();

  const todo = {
    status: request.body.status,
  };
  console.log(request.body);
  console.log(todo);

  const updatedTodo = await Todo.findByIdAndUpdate(id, todo, { new: true });
  if (updatedTodo) {
    response.status(200).json(updatedTodo.toJSON());
  } else {
    response.status(404).end();
  }
});

// refactored with express-async-errors library
todoRouter.delete("/:id", async (request, response, next) => {
  const id = request.params.id.toString();
  console.log("todo id", id);

  const todo = await Todo.findById(id);
  console.log("todo", id);
  const userFromTodo = todo.user;
  console.log("user id from todo", userFromTodo);
  const token = request.token;
  console.log("token", token);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  console.log("decodedToten", decodedToken);
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: "token mising or invalid" });
  }
  const userFromToken = await User.findById(decodedToken.id);
  if (!userFromToken) {
    response.status(400).end();
  }
  console.log("userFromToken", userFromToken);
  console.log("user id from todo", userFromTodo);

  // if (!userFromToken) {
  //   return response.status(404).json({ error: "User not found" });
  // }

  if (userFromToken.id.toString() == userFromTodo.toString()) {
    await Todo.findByIdAndRemove(id);
  } else {
    response.status(400).end();
  }

  response.status(204).end();
});

// todoRouter.delete("/:id", (request, response, next) => {
//   console.log(request);
//   Todo.findByIdAndRemove(request.params.id)
//     .then(() => {
//       response.status(204).end();
//     })
//     .catch((error) => next(error));
// });

module.exports = todoRouter;
