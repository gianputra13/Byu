const puppeterService = require("../services/puppeteerService");
const dateService = require("../services/dateService");
const { logging } = require("../services/errorServices"); 

const postOrderPulsaByu = async (req, res) => {
  try {
    // Incoming request from text buffer
    const buffer = req.body;
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
    // If nomer contains 62, then force to 0
    if (currentObj.nomer.includes("62")) {
      console.log("Masuk");
      currentObj.nomer = currentObj.nomer.replace("62", "0");
    }
    // Get Digipos Code Payment From Puppeteer Service
    const digiposCodePayment = await puppeterService.orderPulsaByu(currentObj.nomer, currentObj.nominal);
    // Response Buffer Text
    res.send(`STATUS=SUKSES&KODEBYR=${digiposCodePayment}&NOMOR=${currentObj.nomer}`);
  } catch (error) {
    console.log(error);
    logging.error(`[${dateService.currentFormatDate()}]`);
    logging.error(error);
    res.send(`STATUS=GAGAL&PESAN=${error.message}`);
  }
};

module.exports = { postOrderPulsaByu };
