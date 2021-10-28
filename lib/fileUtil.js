const fs = require("fs");
const path = require("path");
const helper = require("./helper");
var lib = {
  baseDir: path.join(__dirname, "/../.data/"),
};

//creating
lib.create = (dir, filename, data, callback) => {
  //open file for writing
  const filePath = lib.baseDir + dir + "\\" + filename + ".json";
  fs.open(filePath, "wx", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      //convert the data to string
      const stringData = JSON.stringify(data);
      //write th file and close it
      fs.writeFile(fileDescriptor, stringData, (err) => {
        if (!err) {
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              callback(false);
            } else {
              callback("Error closing the new file");
            }
          });
        } else {
          callback("Error writing to new file");
        }
      });
    } else {
      callback("could not creat new file, it may already exist");
    }
  });
};

//check if a file exist
lib.exist = async (dir, filename) => {
  let isAvailable;
  const filePath = lib.baseDir + dir + "\\" + filename + ".json";
  await fs.promises
    .access(filePath, fs.constants.R_OK)
    .then(() => {
      isAvailable = true;
    })
    .catch((isAvailable = false));

  return isAvailable;
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
      console.log({ fileDescriptor });
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
lib.updateAvailable = async (dir, query, callback) => {
  const fsPromises = fs.promises;
  const filePath = lib.baseDir + dir + "\\" + query.book + ".json";
  //open the file
  try {
    const filehandle = await fsPromises.open(filePath, "r+");
    const fileDescriptor = filehandle.fd.toString();
    let bookToUpdate = await fsPromises.readFile(filePath, "utf-8");
    bookToUpdate = JSON.parse(bookToUpdate);

    const copies = (parseInt(bookToUpdate.copies) - 1).toString();

    let updatedBook = helper.formatObject(bookToUpdate, { copies });
    let updatedData = JSON.stringify(updatedBook);

    fsPromises.truncate(fileDescriptor);
    const b = await fsPromises.writeFile(filePath, updatedData);
    console.log({ b });
    filehandle.close();
  } catch (err) {
    console.log("open failed", err);
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
  z;
};

module.exports = lib;
