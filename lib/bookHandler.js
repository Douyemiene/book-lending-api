const fileUtil = require("./fileUtil");
const bookHandler = {};
const helper = require("./helper");

bookHandler.books = (data, callback) => {
  const acceptableHeaders = ["post", "get", "put", "delete"];
  if (acceptableHeaders.indexOf(data.method) > -1) {
    bookHandler._books[data.method](data, callback);
  } else {
    callback(405);
  }
};

//main book route object
bookHandler._books = {};

//Post route -- for creating a book
bookHandler._books.post = (data, callback) => {
  //validate that all required fields are filled out
  var name =
    typeof data.payload.name === "string" && data.payload.name.trim().length > 0
      ? data.payload.name
      : false;
  var price =
    typeof data.payload.price === "string" &&
    !isNaN(parseInt(data.payload.price))
      ? data.payload.price
      : false;
  var author =
    typeof data.payload.author === "string" &&
    data.payload.author.trim().length > 0
      ? data.payload.author
      : false;
  var publisher =
    typeof data.payload.publisher === "string" &&
    data.payload.publisher.trim().length > 0
      ? data.payload.publisher
      : false;

  // Admin adding number of available copies
  var copies =
    typeof data.payload.copies === "string" &&
    !isNaN(parseInt(data.payload.copies))
      ? data.payload.copies
      : false;

  if (name && price && author && publisher && copies) {
    const fileName = helper.generateRandomString(30);
    try {
      fileUtil.create("books", fileName, data.payload, callback);
    } catch (err) {
      callback(400, { message: "could creatr book" });
    }
  } else {
    callback(400, { message: "Some fields are incorrect" });
  }
};

//Get route -- for geting a book
bookHandler._books.get = (data, callback) => {
  if (data.query.name) {
    fileUtil.read("books", data.query.name, (err, data) => {
      if (!err && data) {
        callback(200, { message: "book retrieved", data: data });
      } else {
        callback(404, {
          err: err,
          data: data,
          message: "could not retrieve book",
        });
      }
    });
  } else {
    callback(404, { message: "book not found", data: null });
  }
};

//Put route -- for updating a book
bookHandler._books.put = (data, callback) => {
  if (data.query.name) {
    fileUtil.update("books", data.query.name, data.payload, (err) => {
      if (!err) {
        callback(200, { message: "book updated successfully" });
      } else {
        callback(400, {
          err: err,
          data: null,
          message: "could not update book",
        });
      }
    });
  } else {
    callback(404, { message: "book not found" });
  }
};

//Delete route -- for deleting a book
bookHandler._books.delete = (data, callback) => {
  if (data.query.name) {
    fileUtil.delete("books", data.query.name, (err) => {
      if (!err) {
        callback(200, { message: "book deleted successfully" });
      } else {
        callback(400, { err: err, message: "could not delete book" });
      }
    });
  } else {
    callback(404, { message: "book not found" });
  }
};

module.exports = bookHandler;
