const fileUtil = require("./fileUtil");
const helper = require("./helper");

let userHandler = {};

// User route handler
userHandler.User = (data, callback) => {
  const acceptableHeaders = ["post", "get", "delete"];
  if (acceptableHeaders.indexOf(data.method) > -1) {
    userHandler._user[data.method](data, callback);
  } else {
    callback(405);
  }
};

//main user route object
userHandler._user = {};

//Post route -- for creating a user
userHandler._user.post = async (data, callback) => {
  //validate that all required fields are filled out
  let name =
    typeof data.payload.name === "string" && data.payload.name.trim().length > 0
      ? data.payload.name
      : false;

  let age =
    typeof data.payload.age === "string" && !isNaN(parseInt(data.payload.age))
      ? data.payload.age
      : false;

  if (name && age) {
    const fileName = `${name.split(" ").shift()}_${name
      .split(" ")
      .pop()}_${age}`;

    // creating unique ID for each user
    let user_id = helper.generateRandomString(4);

    data.payload.id = user_id;

    fileUtil.create(
      "users",
      fileName,
      {
        payload: data.payload,
        trimedPath: data.trimedPath,
      },
      callback
    );
  } else {
    callback(400, { message: "Provide both name and age" });
  }
};

userHandler.lendBook = async (data, callback) => {
  if (data.method === "put") {
    //only if the book and user is available
    try {
      await fileUtil.exist("users", data.query.name);
      await fileUtil.exist("books", data.query.book);
      fileUtil.updateAvailable("books", data.query, true, callback);
    } catch {
      callback(405, { message: "not found" });
    }
  }
};

userHandler.returnBook = async (data, callback) => {
  if (data.method === "put") {
    //only if the book and user is available
    try {
      await fileUtil.exist("users", data.query.name);
      await fileUtil.exist("books", data.query.book);
      fileUtil.updateAvailable("books", data.query, false, callback);
    } catch {
      callback(405, { message: "not found" });
    }
  }
};

userHandler.returnBook = () => {};
module.exports = userHandler;
