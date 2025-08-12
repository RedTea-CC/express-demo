var express = require("express");
var router = express.Router();
const fs = require("fs");
const path = require("path");

/* GET home page. */
router.get("/", function (req, res, next) {
  fs.createReadStream(path.resolve(__dirname, "../public/index.html")).pipe(res);
});

module.exports = router;
