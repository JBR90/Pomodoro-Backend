const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");

const api = supertest(app);
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

beforeEach(async () => {
  await Todo.deleteMany({});
  let todoObject = new Todo(initialTodos[0]);
  await todoObject.save();
  todoObject = new Todo(initialTodos[1]);
  await todoObject.save();
});

test("todos are returned as json", async () => {
  await api
    .get("/api/pom")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("there are two notes", async () => {
  const response = await api.get("/api/pom");

  expect(response.body).toHaveLength(initialTodos.length);
});

test("the first note status is false", async () => {
  const response = await api.get("/api/pom");

  expect(response.body[0].status).toBe(false);
});

test("a specific todo is within the returned notes", async () => {
  const response = await api.get("/api/pom");

  const contents = response.body.map((r) => r.todo);
  expect(contents).toContain("i must do this");
});

test("a valid note can be added", async () => {
  const newTodo = {
    todo: "this is a test todo",
    status: "false",
  };

  await api
    .post("/api/pom")
    .send(newTodo)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const response = await api.get("/api/pom");
  const contents = response.body.map((r) => r.todo);

  expect(response.body).toHaveLength(initialTodos.length + 1);
  expect(contents).toContain("this is a test todo");
});

test("todo without content is not added", async () => {
  const newTodo = {
    status: true,
  };

  await api.post("/api/pom").send(newTodo).expect(400);

  const response = await api.get("/api/pom");

  expect(response.body).toHaveLength(initialTodos.length);
});

afterAll(() => {
  mongoose.connection.close();
});
