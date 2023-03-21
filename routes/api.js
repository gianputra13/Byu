const express = require("express");
const router = express.Router();

const apiController = require("../controller/apiController");

router
  .post("/pulsa", apiController.postOrderPulsaByu)
  .post("/products", apiController.postProductLists)
  .get("/products", apiController.getProductLists);


module.exports = router;
