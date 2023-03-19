const { Console } = require("console");
const fs = require("fs");
const path = require("path");

// Create My Own Logging
const logging = new Console({
  stdout: fs.createWriteStream(path.join(__dirname, "../errorLog/accessLog.log")),
  stderr: fs.createWriteStream(path.join(__dirname, "../errorLog/errorLog.log")), 
});

module.exports = { logging };
