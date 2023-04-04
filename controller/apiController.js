const puppeterService = require("../services/puppeteerService");
const cheerioSerive = require("../services/cheerioService");
const dateService = require("../services/dateService");
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

const postOrderPaketByu = async (req, res) => {
  try {
    // Incoming request from text buffer and generate object
    const resultPayload = createObjectFromBuffer(req.body);
    // Payload Validation
    if (
      !resultPayload.tujuan ||
      !resultPayload.idpaket ||
      !resultPayload.trxid
    ) {
      return res.send(`STATUS=GAGAL&PESAN=Pastikan tujuan, idpaket, trxid sudah tercantum diparsing`);
    }
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
    // Response Buffer Text
    res.send(
      `STATUS=SUKSES&KODEBYR=${digiposCodePayment}&NOMOR=${
        resultPayload.tujuan
      }&TRXID=${resultPayload.trxid}`
    );
  } catch (error) {
    console.log(error);
    logging.error(`[${dateService.currentFormatDate()}]`);
    logging.error(error);
    res.send(`STATUS=GAGAL&PESAN=${error.message}`);
  }
};

const getOrderPaketByu = async (req, res) => {
  try {
    const payload = req.query;
    // Payload Validation
    if (
      !payload.tujuan ||
      !payload.idpaket ||
      !payload.trxid
    ) {
      return res.send(`STATUS=GAGAL&PESAN=Pastikan tujuan, idpaket, trxid sudah tercantum diparsing`);
    }
    // Get Digipos Code Payment From Puppeteer Service
    console.info(
      `[${dateService.currentFormatDate()}] Aksi Get Kode Digipos ${JSON.stringify(
        payload
      )}`
    );
    const digiposCodePayment = await puppeterService.orderPulsaByu(
      payload.tujuan,
      payload.idpaket
    );
    // Response Buffer Text
    res.send(
      `STATUS=SUKSES&KODEBYR=${digiposCodePayment}&NOMOR=${
        payload.tujuan
      }&TRXID=${payload.trxid}`
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
    // Payload Validation
    if (!resultPayload.tujuan) {
      res.send("STATUS=GAGAL&PESAN=Pastikan tujuan sudah tercantum diparsing");
    }
    // Get Full Element Html
    const resultListPaketData = await puppeterService.getProductList(
      resultPayload.tujuan
    );
    // const resultListPaketData = cheerioSerive.getListPaketData(fullHtml);
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
      res.send("STATUS=GAGAL&PESAN=Pastikan tujuan sudah tercantum diparsing");
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

const postOrderPaketByuWithVerify = async (req, res) => {
  try {
    // Incoming request from text buffer and generate object
    const resultPayload = createObjectFromBuffer(req.body);
    // Payload Validation
    if (
      !resultPayload.tujuan ||
      !resultPayload.idpaket ||
      !resultPayload.quota ||
      !resultPayload.price ||
      !resultPayload.textDescription ||
      !resultPayload.trxid
    ) {
      return res.send(`STATUS=GAGAL&PESAN=Pastikan tujuan, idPaket, quota, price, textDescription, trxid sudah tercantum diparsing`);
    }

    // Get Digipos Code Payment From Puppeteer Service
    console.info(
      `[${dateService.currentFormatDate()}] Aksi Get Kode Digipos ${JSON.stringify(
        resultPayload
      )}`
    );
    const digiposCodePayment = await puppeterService.orderPaketWithVerify(
      resultPayload.tujuan,
      resultPayload.idpaket,
      resultPayload.quota,
      resultPayload.price,
      resultPayload.textDescription,
    );
    // Response Buffer Text
    res.send(
      `STATUS=SUKSES&KODEBYR=${digiposCodePayment}&NOMOR=${
        resultPayload.tujuan
      }&TRXID=${resultPayload.trxid}`
    );  
  } catch (error) {
    if (error.message === "DETAILS_PAKET_NOT_AVAILABLE") {
      return res.send(`STATUS=GAGAL&PESAN=Detail paket yang diminta tidak tersedia`);
    }
    console.log(error);
    logging.error(`[${dateService.currentFormatDate()}]`);
    logging.error(error);
    res.send(`STATUS=GAGAL&PESAN=${error.message}`);
  }
};

const getOrderPaketByuWithVerify = async (req, res) => {
  try {
    // Incoming request from text buffer and generate object
    const payload = req.query;
    // Payload Validation
    if (
      !payload.tujuan ||
      !payload.idpaket ||
      !payload.quota ||
      !payload.price ||
      !payload.textDescription ||
      !payload.trxid
    ) {
      return res.send(`STATUS=GAGAL&PESAN=Pastikan tujuan, idPaket, quota, price, textDescription, trxid sudah tercantum diparsing`);
    }
    // Get Digipos Code Payment From Puppeteer Service
    console.info(
      `[${dateService.currentFormatDate()}] Aksi Get Kode Digipos ${JSON.stringify(
        payload
      )}`
    );
    const digiposCodePayment = await puppeterService.orderPaketWithVerify(
      payload.tujuan,
      payload.idpaket,
      payload.quota,
      payload.price,
      payload.textDescription,
    );
    // Response Buffer Text
    res.send(
      `STATUS=SUKSES&KODEBYR=${digiposCodePayment}&NOMOR=${
        payload.tujuan
      }&TRXID=${payload.trxid}`
    );  
  } catch (error) {
    if (error.message === "DETAILS_PAKET_NOT_AVAILABLE") {
      return res.send(`STATUS=GAGAL&PESAN=Detail paket yang diminta tidak tersedia`);
    }
    console.log(error);
    logging.error(`[${dateService.currentFormatDate()}]`);
    logging.error(error);
    res.send(`STATUS=GAGAL&PESAN=${error.message}`);
  }
}

module.exports = {
  postOrderPaketByu,
  getOrderPaketByu,
  postProductLists,
  getProductLists,
  postOrderPaketByuWithVerify,
  getOrderPaketByuWithVerify,
};
