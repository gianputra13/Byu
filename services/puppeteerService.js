const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { Logging } = require("../utils/logging.utils");
const dateService = require("./dateService");
const cheerioService = require("./cheerioService");
const path = require("path");
const fs = require("fs");

let PUPPETER_PAGE;
let identity = null;

async function submitNumberAndBuy(number) {
  const TAG = submitNumberAndBuy.name;
  Logging.INFO(TAG, "Start action");
  const inputNumberSelector = "#inputNumber";
  await PUPPETER_PAGE.waitForNavigation({ waitUntil: "load" });
  await PUPPETER_PAGE.waitForSelector(inputNumberSelector);
  await PUPPETER_PAGE.type(inputNumberSelector, number, { delay: 200 });
  const buttonBuySelector = "#inputNumber ~ button";
  await PUPPETER_PAGE.waitForSelector(buttonBuySelector);
  await PUPPETER_PAGE.click(buttonBuySelector);
  Logging.INFO(TAG, "End action");
}

async function changeTabToPulsaPage() {
  // const waitTime = 3000;
  // setTimeout(async () => {
  const TAG = changeTabToPulsaPage.name;
  Logging.INFO(TAG, "Start action");
  const tabSelector = "button[data-target='#pilih-pulsa']";
  await PUPPETER_PAGE.waitForSelector(tabSelector);
  await PUPPETER_PAGE.click(tabSelector);
  Logging.INFO(TAG, "End action");
  return true;
  // }, waitTime);
}

async function pickNominalPulsa(nominalId) {
  const TAG = pickNominalPulsa.name;
  const waitTime = 3000;
  await new Promise((resolve) => setTimeout(resolve, waitTime));
  Logging.INFO(TAG, "Start action");
  const nominalSelector = `#${nominalId}`;
  await PUPPETER_PAGE.waitForSelector(nominalSelector);
  await PUPPETER_PAGE.click(nominalSelector);
  Logging.INFO(TAG, "End action");
  return true;
}

async function clickCheckoutCart() {
  const waitTime = 500;
  setTimeout(async () => {
    const TAG = clickCheckoutCart.name;
    Logging.INFO(TAG, "Start action");
    const buttonSelector = "button[class='a-btn a-btn--primary']";
    await PUPPETER_PAGE.waitForSelector(buttonSelector);
    await PUPPETER_PAGE.click(buttonSelector);
    Logging.INFO(TAG, "End action");
  }, waitTime);
}

async function pickPaymentMethod(paymentElementId) {
  const TAG = pickPaymentMethod.name;
  Logging.INFO(TAG, "Start Action");
  const paymentMethodSelector = `input#${paymentElementId}`;
  await PUPPETER_PAGE.waitForSelector(paymentMethodSelector);
  await PUPPETER_PAGE.click(paymentMethodSelector);
  Logging.INFO(TAG, "End action");
}

const orderPaketDataByu = async (number, idpaket) => {
  fs.rmSync(path.join(__dirname, "../myUserDataDir"), {
    recursive: true,
    force: true,
  });
  const browser = await puppeteer.launch({
    userDataDir: path.join(__dirname, "../myUserDataDir"),
    headless: true,
  });

  const page = await browser.newPage();

  //set userAgent Browser
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36";
  await page.setUserAgent(userAgent);

  //Url
  await page.goto("https://www.byu.id/v2/i-renew/input-nomor", {
    timeout: 20000,
  });

  //set inputNumber
  console.info(`[${dateService.currentFormatDate()}] Masuk`);
  await page.type("#inputNumber", number);

  // Click Button Buy
  console.info(`[${dateService.currentFormatDate()}] Aksi Button Beli`);
  const buttonBuySelector = "#inputNumber ~ button";
  await page.waitForSelector(buttonBuySelector);
  await page.click(buttonBuySelector);

  // Click Tab Paket Data
  console.info(`[${dateService.currentFormatDate()}] Aksi Klik Tab Paket Data`);
  const selectorTabPaketData = "button[data-target='#pilih-paket']";
  await page.waitForSelector(selectorTabPaketData);
  await page.click(selectorTabPaketData, { delay: 1000 });

  // Cek Keranjang
  console.info(`[${dateService.currentFormatDate()}] Aksi Cek Isi Keranjang`);
  const value = ".m-cart__count span";
  await page.waitForSelector(value);
  const countValue = await page.evaluate(() => {
    const cartCountElement = document.querySelector(".m-cart__icon span");
    return cartCountElement.innerText;
  });

  // If Cart Available, Remove Item from cart
  console.info(`[${dateService.currentFormatDate()}] Total Cart ${countValue}`);
  if (countValue >= 1) {
    console.info(
      `[${dateService.currentFormatDate()}] Aksi Masuk IF Total Cart ${countValue}`
    );
    // Click element keranjang
    console.info(`[${dateService.currentFormatDate()}] Aksi Klik Keranjang`);
    await page.evaluate(() => {
      const cartList = document.querySelector(".m-cart__card");
      cartList.click({ delay: 4000 });
    });

    // Get All Cart Items And Remove
    const minusButton = ".m-cart-item__right";
    await page.waitForSelector(minusButton);
    console.info(`[${dateService.currentFormatDate()}] Aksi Hapus Keranjang`);
    await page.evaluate(() => {
      const button = document.querySelector(
        `button[class="a-btn a-btn__clear a-btn--primary"]`
      );
      button.click({ delay: 5000 });
    });
  }

  // Click Paket Data
  setTimeout(async () => {
    console.info(
      `[${dateService.currentFormatDate()}] Aksi Menambahkan Paket Data Dengan ID ${idpaket}`
    );
    const buttonSelectPaketData = `#cPredefinePckgBtnWeb${idpaket}`;
    await page.waitForSelector(buttonSelectPaketData, {
      waitUntil: "networkidle0",
    });
    await page.evaluate((buttonSelectPaketData) => {
      const checkbox = document.querySelector(buttonSelectPaketData);
      if (checkbox) {
        priceText = document.querySelector(buttonSelectPaketData).parentElement
          .nextElementSibling.nextElementSibling.children[3].textContent;
        checkbox.click({ delay: 3000 });
      }
    }, buttonSelectPaketData);
  }, 2000);

  //Cek Elemen Popup
  await page
    .waitForSelector(".m-popup-notif__txt", { timeout: 6000 })
    .then(async () => {
      console.info(
        `[${dateService.currentFormatDate()}] Elemen Popup ditemukan`
      );
      await page.waitForSelector("button.a-btn--primary");
      console.info(
        `[${dateService.currentFormatDate()}] Tombol Okei! ditemukan`
      );
      const buttonOke = "button[class='a-btn a-btn--primary']";
      await page.waitForSelector(buttonOke);
      await page.click(buttonOke, { delay: 2000 });
    })
    .catch((error) => {
      if (error.name === "TimeoutError") {
        console.info(
          `[${dateService.currentFormatDate()}] Elemen Popup tidak ditemukan setelah 30 detik`
        );
      }
    });
  // Await Digipos Payment Code With SetTimeout
  const resultDigiposPaymentCode = () => {
    console.info(
      `[${dateService.currentFormatDate()}] Aksi Fungsi Get Payment Code`
    );
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // Click Next To Payment Method
          console.info(
            `[${dateService.currentFormatDate()}] Aksi Klik Next Ke Payment Method`
          );
          const buttonSelector = ".m-cart__btn";
          await page.waitForSelector(buttonSelector);
          await page.evaluate(() => {
            const button = document.querySelector(
              'button[data-test-id="btnNextIrenew"]'
            );
            button.click({ delay: 1000 });
          });
          // Click Payment Method
          console.info(
            `[${dateService.currentFormatDate()}] Aksi Pilih Digipos`
          );
          const selectPaymentMethod = `#digipos`;
          await page.waitForSelector(selectPaymentMethod);
          await page.click(selectPaymentMethod, { delay: 2000 });
          // Click Next After Select Payment Method
          console.info(
            `[${dateService.currentFormatDate()}] Aksi Next After Select Payment Method`
          );
          const buttonNextPayment = `button[data-test-id='NextBtnWeb']`;
          await page.waitForSelector(buttonNextPayment);
          await page.click(buttonNextPayment, { delay: 3000 });
          // Get PaymentCode
          console.info(
            `[${dateService.currentFormatDate()}] Aksi Menunggu Kode Payment`
          );
          const paymentCodeSelector =
            ".m-payment-offline__detail--payment-code";
          await page.waitForSelector(paymentCodeSelector);
          const paymentCode = await page.$(paymentCodeSelector);
          // Cetak nilai paymentcode
          const paymentCodeText = await page.evaluate(
            (el) => el.textContent,
            paymentCode
          );
          // Get PaymentValue
          const element = await page.$(
            ".o-payment-card__total > .a-txt--dark.a-txt--w-bold"
          );
          const totalPrice = await page.evaluate(
            (element) => element.textContent,
            element
          );
          const [, priceWithDot] = totalPrice.split("Rp");
          const price = priceWithDot.split(".").join("").trim();
          // await browser.close();
          console.info(
            `[${dateService.currentFormatDate()}] Aksi Selesai Dengan Kode ${paymentCodeText}`
          );
          console.info(
            `[${dateService.currentFormatDate()}] Aksi Selesai Dengan Pembayaran ${totalPrice}`
          );
          resolve({
            code: paymentCodeText,
            price,
          });
        } catch (error) {
          reject(error);
        }
      }, 5000);
    });
  };
  const result = await resultDigiposPaymentCode();
  return {
    kode: result.code,
    harga: result.price,
  };
};

const getProductList = async (number, adm) => {
  fs.rmSync(path.join(__dirname, "../myUserDataDir"), {
    recursive: true,
    force: true,
  });
  const browser = await puppeteer.launch({
    userDataDir: path.join(__dirname, "../myUserDataDir"),
    headless: true,
  });
  const page = await browser.newPage();

  //set userAgent Browser
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36";
  await page.setUserAgent(userAgent);

  await page.goto("https://www.byu.id/v2/i-renew/input-nomor");

  await page.type("#inputNumber", number);

  // Click Button Buy
  console.info(`[${dateService.currentFormatDate()}] Aksi Klik Tombol Beli`);
  const buttonBuySelector = "#inputNumber ~ button";
  await page.waitForSelector(buttonBuySelector);
  await page.click(buttonBuySelector);

  // Click Tab Paket Data
  console.info(`[${dateService.currentFormatDate()}] Aksi Klik Tab Paket Data`);
  const selectorTabPaketData = "button[data-target='#pilih-paket']";
  await page.waitForSelector(selectorTabPaketData);
  await page.click(selectorTabPaketData);

  // Action Waiting element
  console.info(
    `[${dateService.currentFormatDate()}] Aksi Tunggu Element Loaded`
  );
  // Get Full Content html
  const resultHtml = await new Promise((resolve, reject) => {
    setTimeout(async () => {
      const resultRes = await page.content();
      resolve(resultRes);
    }, 4000);
  });
  // Convert Html content to object
  const resultLists = cheerioService.getListPaketData(resultHtml);
  const remapResultLists = resultLists.map((list) => ({
    ...list,
    totalHarga: parseInt(list.price) + parseInt(adm),
  }));
  await browser.close();
  return remapResultLists;
};

const orderPaketWithVerify = async (
  number,
  idpaket,
  quota,
  price,
  textDescription
) => {
  fs.rmSync(path.join(__dirname, "../myUserDataDir"), {
    recursive: true,
    force: true,
  });
  const browser = await puppeteer.launch({
    userDataDir: path.join(__dirname, "../myUserDataDir"),
    headless: true,
  });

  const page = await browser.newPage();

  //set userAgent Browser
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36";
  await page.setUserAgent(userAgent);

  //Url
  await page.goto("https://www.byu.id/v2/i-renew/input-nomor", {
    timeout: 20000,
  });

  //set inputNumber
  console.info(`[${dateService.currentFormatDate()}] Masuk`);
  await page.type("#inputNumber", number);

  // Click Button Buy
  console.info(`[${dateService.currentFormatDate()}] Aksi Button Beli`);
  const buttonBuySelector = "#inputNumber ~ button";
  await page.waitForSelector(buttonBuySelector);
  await page.click(buttonBuySelector);

  // Click Tab Paket Data
  console.info(`[${dateService.currentFormatDate()}] Aksi Klik Tab Paket Data`);
  const selectorTabPaketData = "button[data-target='#pilih-paket']";
  await page.waitForSelector(selectorTabPaketData, {
    waitUntil: "load",
    timeout: 0,
  });
  await page.click(selectorTabPaketData, { delay: 1000 });

  // Aksi Validasi ProductId & Quota & Price
  console.info(
    `[${dateService.currentFormatDate()}] Aksi Validasi ProductId & Quota & Price`
  );
  // First Validation
  const content = await page.content();
  const results = cheerioService.getListPaketData(content);
  let matchDetailPaket;
  matchDetailPaket = results.filter((result) => {
    if (
      result.productId === idpaket &&
      result.quota === quota &&
      result.price === price &&
      result.textDescription === textDescription
    ) {
      return result;
    }
  });
  // Second Validation, if length of result < 1 getFullHtml again and matching
  if (results.length < 1) {
    console.info(
      `[${dateService.currentFormatDate()}] Masuk Aksi Validasi Ke 2 ProductId & Quota & Price karena hasil pertama checker ke 1 adalah 0`
    );
    const secondContent = await page.content();
    const secondResults = cheerioService.getListPaketData(secondContent);
    matchDetailPaket = secondResults.filter((result) => {
      if (
        result.productId === idpaket &&
        result.quota === quota &&
        result.price === price &&
        result.textDescription === textDescription
      ) {
        return result;
      }
    });
  }

  // If Details Packet is not match, close browser and print all packet
  if (matchDetailPaket < 1) {
    console.info(`[${dateService.currentFormatDate()}] Tidak ada data match`);
    console.info(
      `[${dateService.currentFormatDate()}] ${JSON.stringify(results)}`
    );
    browser.close();
    throw new Error("DETAILS_PAKET_NOT_AVAILABLE");
  }

  // Cek Keranjang
  console.info(`[${dateService.currentFormatDate()}] Aksi Cek Isi Keranjang`);
  const value = ".m-cart__count span";
  await page.waitForSelector(value);
  const countValue = await page.evaluate(() => {
    const cartCountElement = document.querySelector(".m-cart__icon span");
    return cartCountElement.innerText;
  });

  // If Cart Available, Remove Item from cart
  console.info(`[${dateService.currentFormatDate()}] Total Cart ${countValue}`);
  if (countValue >= 1) {
    console.info(
      `[${dateService.currentFormatDate()}] Aksi Masuk IF Total Cart ${countValue}`
    );
    // Click element keranjang
    console.info(`[${dateService.currentFormatDate()}] Aksi Klik Keranjang`);
    await page.evaluate(() => {
      const cartList = document.querySelector(".m-cart__card");
      cartList.click({ delay: 4000 });
    });

    // Get All Cart Items And Remove
    const minusButton = ".m-cart-item__right";
    await page.waitForSelector(minusButton);
    console.info(`[${dateService.currentFormatDate()}] Aksi Hapus Keranjang`);
    await page.evaluate(() => {
      const button = document.querySelector(
        `button[class="a-btn a-btn__clear a-btn--primary"]`
      );
      button.click({ delay: 5000 });
    });
  }

  // Click Paket Data
  setTimeout(async () => {
    console.info(
      `[${dateService.currentFormatDate()}] Aksi Menambahkan Paket Data Dengan ID ${idpaket}`
    );
    const buttonSelectPaketData = `#cPredefinePckgBtnWeb${idpaket}`;
    await page.waitForSelector(buttonSelectPaketData, {
      waitUntil: "networkidle0",
    });
    await page.evaluate((buttonSelectPaketData) => {
      const checkbox = document.querySelector(buttonSelectPaketData);
      if (checkbox) {
        checkbox.click({ delay: 3000 });
      }
    }, buttonSelectPaketData);
  }, 2000);

  //Cek Elemen Popup
  await page
    .waitForSelector(".m-popup-notif__txt", { timeout: 6000 })
    .then(async () => {
      console.info(
        `[${dateService.currentFormatDate()}] Elemen Popup ditemukan`
      );
      await page.waitForSelector("button.a-btn--primary");
      console.info(
        `[${dateService.currentFormatDate()}] Tombol Okei! ditemukan`
      );
      const buttonOke = "button[class='a-btn a-btn--primary']";
      await page.waitForSelector(buttonOke);
      await page.click(buttonOke, { delay: 2000 });
    })
    .catch((error) => {
      if (error.name === "TimeoutError") {
        console.info(
          `[${dateService.currentFormatDate()}] Elemen Popup tidak ditemukan setelah 30 detik`
        );
      }
    });

  // Await Digipos Payment Code With SetTimeout
  const resultDigiposPaymentCode = () => {
    console.info(
      `[${dateService.currentFormatDate()}] Aksi Fungsi Get Payment Code`
    );
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // Click Next To Payment Method
          console.info(
            `[${dateService.currentFormatDate()}] Aksi Klik Next Ke Payment Method`
          );
          const buttonSelector = ".m-cart__btn";
          await page.waitForSelector(buttonSelector);
          await page.evaluate(() => {
            const button = document.querySelector(
              'button[data-test-id="btnNextIrenew"]'
            );
            button.click({ delay: 1000 });
          });

          // Click Payment Method
          console.info(
            `[${dateService.currentFormatDate()}] Aksi Pilih Digipos`
          );
          const selectPaymentMethod = `#digipos`;
          await page.waitForSelector(selectPaymentMethod, {
            timeout: 20000,
          });
          await page.click(selectPaymentMethod, { delay: 2000 });

          // Click Next After Select Payment Method
          console.info(
            `[${dateService.currentFormatDate()}] Aksi Next After Select Payment Method`
          );
          const buttonNextPayment = `button[data-test-id='NextBtnWeb']`;
          await page.waitForSelector(buttonNextPayment);
          await page.click(buttonNextPayment, { delay: 3000 });

          // Get PaymentCode
          console.info(
            `[${dateService.currentFormatDate()}] Aksi Menunggu Kode Payment`
          );
          const paymentCodeSelector =
            ".m-payment-offline__detail--payment-code";
          await page.waitForSelector(paymentCodeSelector);
          const paymentCode = await page.$(paymentCodeSelector);
          // Cetak nilai paymentcode
          const paymentCodeText = await page.evaluate(
            (el) => el.textContent,
            paymentCode
          );

          // Get PaymentValue
          const element = await page.$(
            ".o-payment-card__total > .a-txt--dark.a-txt--w-bold"
          );
          const totalPrice = await page.evaluate(
            (element) => element.textContent,
            element
          );
          const [, priceWithDot] = totalPrice.split("Rp");
          const price = priceWithDot.split(".").join("").trim();
          // await browser.close();
          console.info(
            `[${dateService.currentFormatDate()}] Aksi Selesai Dengan Kode ${paymentCodeText}`
          );
          console.info(
            `[${dateService.currentFormatDate()}] Aksi Selesai Dengan Pembayaran ${totalPrice}`
          );
          resolve({
            code: paymentCodeText,
            price,
          });
        } catch (error) {
          reject(error);
        }
      }, 5000);
    });
  };
  const result = await resultDigiposPaymentCode();
  return {
    kode: result.code,
    harga: result.price,
  };
};

const orderPulsaByu = async (phoneNumber, pulsaElementId, paymentElementId) => {
  puppeteer.use(StealthPlugin());
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  PUPPETER_PAGE = await browser.newPage();
  await PUPPETER_PAGE.setRequestInterception(true);
  PUPPETER_PAGE.on("request", (request) => {
    request.continue();
  });
  let responseBody = null;
  const waitForResponseLog = new Promise((resolve) => {
    PUPPETER_PAGE.on("response", async (response) => {
      const responseUrl = response.url();
      try {
        if (
          responseUrl !== "https://api.byu.id/api/irenew-web/order" &&
          responseUrl !== "https://www.byu.id/v2/i-renew/payment"
        )
          return;
        const jsonResponse = await response.json();

        if (jsonResponse.data.hasOwnProperty("payment_detail")) {
          if (jsonResponse.data.payment_detail.length > 0) {
            console.log("Response Body:", jsonResponse);
            responseBody = jsonResponse;
            resolve(); // Resolve the promise when response is logged
          }
        }
      } catch (error) {
        // console.error('Error:', error);
      }
    });
  });
  PUPPETER_PAGE.on("requestfinished", async (request) => {
    const TAG = "RequestFinish";
    const requestUrl = request.url();
    const ID_ONE = "https://www.byu.id/v2/i-renew/input-nomor";
    const ID_TWO = "https://www.byu.id/v2/assets/img/bg/input-number.svg";
    const ID_THREE = "https://www.byu.id/v2/i-renew/payment";
    switch (requestUrl) {
      case ID_ONE:
        console.log({ identity });
        if (identity === ID_ONE) break;
        identity = ID_ONE;
        Logging.WARNING(TAG, "ID_ONE");
        await submitNumberAndBuy(phoneNumber);
        break;
      case ID_TWO:
        console.log({ identity });
        if (identity === ID_TWO) break;
        identity = ID_TWO;
        Logging.WARNING(TAG, "ID_TWO");
        const changeFinish = await changeTabToPulsaPage();
        if (changeFinish) {
          const pickFinish = await pickNominalPulsa(pulsaElementId);
          if (pickFinish) {
            await clickCheckoutCart();
          }
        }
        break;
      case ID_THREE:
        console.log({ identity });
        if (identity === ID_THREE) break;
        identity = ID_THREE;
        Logging.WARNING(TAG, "ID_THREE");
        await pickPaymentMethod(paymentElementId);
        await clickCheckoutCart();
        break;
    }
  });
  await PUPPETER_PAGE.goto("https://www.byu.id/v2/i-renew/input-nomor");
  await waitForResponseLog; // Wait for the response to be logged
  console.log("Browser close....");
  await browser.close();
  return responseBody;
};

// (async () => {
//   try {
//     const resultData = await orderPulsaByu("085173292091", "cCrdtIrnwId10000");
//     console.log(resultData.data.payment_detail[0]);
//     console.log(resultData.data.order_detail[0]);
//   } catch (error) {
//     console.log(error);
//   }
// })();

module.exports = {
  orderPaketDataByu,
  getProductList,
  orderPaketWithVerify,
  orderPulsaByu,
};
