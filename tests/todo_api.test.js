const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");
const jwt = require("jsonwebtoken");

const api = supertest(app);
const Todo = require("../models/todo");
const User = require("../models/user");

const usersRouter = require("../controller/users");
// const { response, request } = require("../app");
const logger = require("../utils/logger");
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

let token;
let tokenNoTodo;

// beforeAll(async () => {
//   let response = await api.post("/api/login").send({
//     username: "jbr3",
//     password: "password3",
//   });

//   console.log("response token", response.body.token);
// });

beforeEach(async () => {
  await Todo.deleteMany({});
  await User.deleteMany({});

  const rootUser = await new User({
    username: "root",
    password: "secret",
  }).save();

  const userWithNoTodos = await new User({
    username: "notRoot",
    password: "secret,",
  });

  const userForToken = { username: rootUser.username, id: rootUser.id };
  token = jwt.sign(userForToken, process.env.SECRET);

  const userNoTodoToken = {
    username: userWithNoTodos.username,
    id: userWithNoTodos.id,
  };
  tokenNoTodo = jwt.sign(userNoTodoToken, process.env.SECRET);

  await Promise.all(
    helper.initialTodos.map((todo) => {
      todo.user = rootUser.id;
      return new Todo(todo).save();
    })
  );

  // const todoObjects = helper.initialTodos.map((todo) => new Todo(todo));
  // const promiseArray = todoObjects.map((todo) => todo.save());
  // await Promise.all(promiseArray);

  // await api.post("/api/login").send({
  //   username: "jbr3",
  //   password: "password3",
  // });
  // let res = response;
  // // token = response.body.token;
  // console.log(res.status);
});

test("todos are returned as json", async () => {
  await api
    .get("/api/pom")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("there are two notes", async () => {
  const response = await api.get("/api/pom");

  expect(response.body).toHaveLength(helper.initialTodos.length);
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

test("a valid todo can be added", async () => {
  const newTodo = {
    todo: "this is a test todo",
    status: "false",
  };

  await api
    .post("/api/pom")
    .send(newTodo)
    .set("Authorization", `bearer ${token}`)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const todosAtEnd = await helper.todosInDb();

  expect(todosAtEnd).toHaveLength(helper.initialTodos.length + 1);

  const contents = todosAtEnd.map((t) => t.todo);
  expect(contents).toContain("this is a test todo");
});

test("todo without content is not added", async () => {
  const newTodo = {
    status: true,
  };

  await api.post("/api/pom").send(newTodo).expect(400);

  const todosAtEnd = await helper.todosInDb();

  expect(todosAtEnd).toHaveLength(helper.initialTodos.length);
});

test("a specific todo can be viewed", async () => {
  const todoAtStart = await helper.todosInDb();

  const todoToView = todoAtStart[0];

  const resultTodo = await api
    .get(`/api/pom/${todoToView.id}`)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const processedTodoToView = JSON.parse(JSON.stringify(todoToView));

  expect(resultTodo.body).toEqual(processedTodoToView);
});

test("a todo can be deleted by the user who created it", async () => {
  const todosAtStart = await helper.todosInDb();
  const todoToDelete = todosAtStart[0];
  console.log("todoTODelete");
  console.log(todoToDelete);

  await api
    .delete(`/api/pom/${todoToDelete.id}`)
    .set("Authorization", `bearer ${token}`)
    .expect(204);

  const todoAtEnd = await helper.todosInDb();

  expect(todoAtEnd).toHaveLength(helper.initialTodos.length - 1);

  const contents = todoAtEnd.map((r) => r.todo);

  expect(contents).not.toContain(todoToDelete.todo);
});

test("a todo cannot be deleted by a user that did not create it", async () => {
  const todosAtStart = await helper.todosInDb();
  const todoToDelete = todosAtStart[0];
  console.log("todoTODelete");
  console.log(todoToDelete);

  await api
    .delete(`/api/pom/${todoToDelete.id}`)
    .set("Authorization", `bearer ${tokenNoTodo}`)
    .expect(400);

  const todoAtEnd = await helper.todosInDb();

  expect(todoAtEnd).toHaveLength(helper.initialTodos.length);

  const contents = todoAtEnd.map((r) => r.todo);

  expect(contents).toContain(todoToDelete.todo);
});

afterAll(() => {
  mongoose.connection.close();
});
