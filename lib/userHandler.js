const fileUtil = require("./fileUtil");
const helper = require("./helper");

class UserHandler {
  static router(data, callback) {
    console.log("here");
    const acceptableHeaders = ["post", "get", "delete"];
    if (acceptableHeaders.indexOf(data.method) > -1) {
      const router = UserHandler[data.method];
      console.log({ router });
      router(data, callback);
    } else {
      callback(405);
    }
  }

  // post --> create new user
  static async post(data, callback) {
    //validate that all required fields are filled out
    let name =
      typeof data.payload.name === "string" &&
      data.payload.name.trim().length > 0
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
      const tri = data.trimedPath;
      console.log({ tri });
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
  }

  // delete --> create new user
  static async delete(data, callback) {
    if (data.query.name) {
      fileUtil.delete("users", data.query.name, (err) => {
        if (!err) {
          callback(200, { message: "book deleted successfully" });
        } else {
          callback(400, { err: err, message: "could not delete book" });
        }
      });
    } else {
      callback(404, { message: "book not found" });
    }
  }
}

module.exports = UserHandler.router;
