const mongoose = require("mongoose");

// const logger = require("../utils/logger");

const todoSchema = new mongoose.Schema({
  todo: String,
  status: Boolean,
});

todoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Todo", todoSchema);
