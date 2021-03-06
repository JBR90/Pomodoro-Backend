const Todo = require("../models/todo");
const User = require("../models/user");

const initialTodos = [
  {
    todo: "i must do this",
    status: "false",
  },
  {
    todo: "i must do this now",
    status: "false",
  },
];

const nonExistingId = async () => {
  const todo = new Todo({
    todo: "willremovethissoon",
    status: true,
  });
  await todo.save();
  await todo.remove();

  return todo._id.toString();
};

const todosInDb = async () => {
  const todos = await Todo.find({});
  return todos.map((todo) => todo.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

module.exports = {
  initialTodos,
  nonExistingId,
  todosInDb,
  usersInDb,
};
