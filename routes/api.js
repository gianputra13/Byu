const express = require("express");
const router = express.Router();

const apiController = require("../controller/apiController");

router.post("/pulsa", apiController.postOrderPulsaByu);

module.exports = router;
