const puppeterService = require("../services/puppeteerService");
const cheerioSerive = require("../services/cheerioService");
const dateService = require("../services/dateService");
const axios = require("axios");
const { logging } = require("../services/errorServices");

const createObjectFromBuffer = (buffer) => {
  // Convert Buffer To String
  const strBuffer = buffer.toString();
  // Splite StrBuffer By '&'
  const splitedStrBuffer = strBuffer.split("&");
  // Remap SplitedStrBuffer To Array 2 Dimension
  const mappedStr = splitedStrBuffer.map((value) => value.split("="));
  // create Object
  const currentObj = {};
  // create content object from Array 2 Dimension
  mappedStr.forEach((data) => {
    currentObj[data[0]] = data[1];
  });
  // If tujuan contains 62, then force to 0
  if (currentObj.tujuan.includes("62")) {
    console.log("Masuk");
    currentObj.tujuan = currentObj.tujuan.replace("62", "0");
  }
  return currentObj;
};

const postOrderPulsaByu = async (req, res) => {
  try {
    // Incoming request from text buffer and generate object
    const resultPayload = createObjectFromBuffer(req.body);
    // Get Digipos Code Payment From Puppeteer Service
    console.info(
      `[${dateService.currentFormatDate()}] Aksi Get Kode Digipos ${JSON.stringify(
        resultPayload
      )}`
    );
    const digiposCodePayment = await puppeterService.orderPulsaByu(
      resultPayload.tujuan,
      resultPayload.idpaket
    );
    // Get Response Pay Using digipostCodePayment
    console.info(
      `[${dateService.currentFormatDate()}] Hit Pembayaran Dengan Kode Bayar ${digiposCodePayment}`
    );
    const { data: resPay } = await axios.get(
      "http://192.168.1.55:19001/omniChannel",
      {
        username: resultPayload.username,
        pin: resultPayload.pin,
        payment_code: digiposCodePayment,
        payment_method: "LINKAJA",
        trxid: resultPayload.trxid,
      }
    );
    // Response Buffer Text
    res.send(
      `STATUS=SUKSES&KODEBYR=${digiposCodePayment}&NOMOR=${
        resultPayload.tujuan
      }&TRXID=${resultPayload.trxid}&PESAN=${JSON.stringify(resPay)}`
    );
  } catch (error) {
    console.log(error);
    logging.error(`[${dateService.currentFormatDate()}]`);
    logging.error(error);
    res.send(`STATUS=GAGAL&PESAN=${error.message}`);
  }
};

const postProductLists = async (req, res) => {
  try {
    // Incoming request from text buffer and generate object
    const resultPayload = createObjectFromBuffer(req.body);
    // Get Full Element Html
    const fullHtml = await puppeterService.getFullHtmlProductList(
      resultPayload.tujuan
    );
    const resultListPaketData = cheerioSerive.getListPaketData(fullHtml);
    res.send(resultListPaketData);
  } catch (error) {
    console.log(error);
    logging.error(`[${dateService.currentFormatDate()}]`);
    logging.error(error);
    res.send(`STATUS=GAGAL&PESAN=${error.message}`);
  }
};

const getProductLists = async (req, res) => {
  try {
    const { tujuan } = req.query;
    if (!tujuan) {
      res.send("STATUS=GAGAL&PESAN=Tujuan Tidak Ditemukan");
    }
    // Get Full Element Html
    const fullHtml = await puppeterService.getFullHtmlProductList(tujuan);
    const resultListPaketData = cheerioSerive.getListPaketData(fullHtml);
    res.send(resultListPaketData);
  } catch (error) {
    console.log(error);
    logging.error(`[${dateService.currentFormatDate()}]`);
    logging.error(error);
    res.send(`STATUS=GAGAL&PESAN=${error.message}`);
  }
};

module.exports = {
  postOrderPulsaByu,
  postProductLists,
  getProductLists,
};
