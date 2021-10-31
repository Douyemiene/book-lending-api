const fs = require("fs");
const path = require("path");
const helper = require("./helper");
var lib = {
  baseDir: path.join(__dirname, "/../.data/"),
};

//creating
lib.create = async (dir, filename, data, callback) => {
  //open file for writing
  const filePath = lib.baseDir + dir + "\\" + filename + ".json";
  try {
    const fsPromises = fs.promises;
    const filehandle = await fsPromises.open(filePath, "wx");
    //convert the data to string
    const stringData = JSON.stringify(data.payload);
    //write the file and close it
    await fsPromises.writeFile(filePath, stringData);
    await filehandle.close();
    callback(200, {
      message: `${data.trimedPath} was successfully created`,
      data: null,
    });
  } catch (err) {
    callback(400, { message: "could not process request" });
  }
};

//check if a file exist
lib.exist = async (dir, filename, callback) => {
  const filePath = lib.baseDir + dir + "\\" + filename + ".json";
  try {
    await fs.promises.access(filePath, fs.constants.R_OK);
    return true;
  } catch (err) {
    return false;
  }
};

//reding
lib.read = (dir, filename, callback) => {
  const filePath = lib.baseDir + dir + "\\" + filename + ".json";
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (!err && data) {
      callback(false, JSON.parse(data));
    } else {
      callback(err, data);
    }
  });
};

//updating
lib.update = (dir, filename, data, callback) => {
  const filePath = lib.baseDir + dir + "\\" + filename + ".json";
  //open the file
  fs.open(filePath, "r+", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      fs.readFile(fileDescriptor, "utf-8", (err, bookToUpdate) => {
        if (!err && bookToUpdate) {
          let updatedBook = helper.formatObject(JSON.parse(bookToUpdate), data);
          var updatedData = JSON.stringify(updatedBook);
          //truncate the fule for update;
          fs.truncate(fileDescriptor, (err) => {
            if (!err) {
              fs.writeFile(filePath, updatedData, (err) => {
                if (!err) {
                  fs.close(fileDescriptor, (err) => {
                    if (!err) {
                      callback(false);
                    } else {
                      callback("error closing the file");
                    }
                  });
                } else {
                  callback("error writing to existing file");
                }
              });
            }
          });
        } else {
          callback(err);
        }
      });
    } else {
      callback("could not open file for updating, maybe it does not exist");
    }
  });
};

//decreases the avaioable copies
lib.updateAvailable = async (dir, query, addCopy, callback) => {
  //use the fs module with promises
  const fsPromises = fs.promises;
  const filePath = lib.baseDir + dir + "\\" + query.book + ".json";

  const whatWasDone = addCopy ? "borrow" : "return";
  try {
    //open the file to get fileDescripteor
    const filehandle = await fsPromises.open(filePath, "r+");
    //const fileDescriptor = filehandle.fd.toString();

    //get the current content of the book
    let bookToUpdate = await fsPromises.readFile(filePath, "utf-8");
    bookToUpdate = JSON.parse(bookToUpdate);
    let copies;
    if (addCopy) {
      copies = (parseInt(bookToUpdate.copies) - 1).toString();
    } else {
      copies = (parseInt(bookToUpdate.copies) + 1).toString();
    }
    //update book by decreasing the copies available
    let updatedBook = helper.formatObject(bookToUpdate, { copies });
    let updatedData = JSON.stringify(updatedBook);
    fsPromises.truncate(filePath);
    await fsPromises.writeFile(filePath, updatedData);
    //close file
    await filehandle.close();
    callback(200, {
      message: `successfully ${whatWasDone}ed book`,
      book: updatedBook,
    });
  } catch (err) {
    callback(400, {
      err: err,
      data: null,
      message: `could not ${whatWasDone} book`,
    });
  }
};

//Delete File
lib.delete = (dir, filename, callback) => {
  const filePath = lib.baseDir + dir + "\\" + filename + ".json";
  fs.unlink(filePath, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback(err);
    }
  });
};

module.exports = lib;
