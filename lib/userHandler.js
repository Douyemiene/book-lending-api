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
userHandler._user.post = (data, callback) => {
  //validate that all required fields are filled out
  var name =
    typeof data.payload.name === "string" && data.payload.name.trim().length > 0
      ? data.payload.name
      : false;

  var age =
    typeof data.payload.age === "string" && !isNaN(parseInt(data.payload.age))
      ? data.payload.age
      : false;

  if (name && age) {
    const fileName = `${name.split(" ").shift()}_${name
      .split(" ")
      .pop()}_${age}`;

    // creating unique ID for each user
    var user_id = helper.generateRandomString(4);

    data.payload.id = user_id;

    fileUtil.create("users", fileName, data.payload, (err) => {
      if (!err) {
        callback(200, {
          message: "user registered successfully",
          data: null,
        });
      } else {
        callback(400, { message: "could add user" });
      }
    });
  } else {
    callback(400, { message: "Provide both name and age" });
  }
};

userHandler.lendBook = async (data, callback) => {};

userHandler.returnBook = () => {};
module.exports = userHandler;
