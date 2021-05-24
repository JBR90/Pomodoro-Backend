const Todo = require("../models/todo");

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

const todoInDb = async () => {
  const todo = await Todo.find({});
  return notes.map((todo) => todo.toJSON());
};

module.exports = {
  initialTodos,
  nonExistingId,
  todoInDb,
};
