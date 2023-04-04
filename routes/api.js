const express = require("express");
const router = express.Router();

const apiController = require("../controller/apiController");

router
  .post("/paket", apiController.postOrderPaketByu)
  .get("/paket", apiController.getOrderPaketByu)
  .post("/products", apiController.postProductLists)
  .get("/products", apiController.getProductLists)
  .post("/paketh2h", apiController.postOrderPaketByuWithVerify)
  .get("/paketh2h", apiController.getOrderPaketByuWithVerify);


module.exports = router;
