const fileUtil = require("./fileUtil");
// const helper = require("./helper");

let otherHandler = {};

// lendbook --> get request
otherHandler.lendbook = async (data, callback) => {
  if (data.method === "get") {
    //only if the book and user is available
    const isUser = await fileUtil.exist("users", data.query.name);
    const isBook = await fileUtil.exist("books", data.query.book);
    if (isUser && isBook) {
      fileUtil.updateAvailable("books", data.query, true, callback);
    } else {
      callback(405, { message: "user or book is not valid" });
    }
  } else {
    callback(405, { message: "not found" });
  }
};

//returnbook --> put request
otherHandler.returnbook = async (data, callback) => {
  if (data.method === "put") {
    //only if the book and user is available
    const isUser = await fileUtil.exist("users", data.query.name);
    const isBook = await fileUtil.exist("books", data.query.book);
    if (isUser && isBook) {
      fileUtil.updateAvailable("books", data.query, true, callback);
    } else {
      callback(405, { message: "user or book is not valid" });
    }
  } else {
    callback(405, { message: "not found" });
  }
};

otherHandler.notfound = (data, callback) => {
  callback(404, { response: "not found" });
};

otherHandler.ping = (data, callback) => {
  callback(200, { response: "server is live" });
};

module.exports = otherHandler;
