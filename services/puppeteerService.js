const puppeteer = require("puppeteer");
const dateService = require("./dateService");
const cheerioService = require("./cheerioService");
const path = require("path");
const fs = require("fs");

const orderPulsaByu = async (number, idpaket) => {
  fs.rmSync(path.join(__dirname, "../myUserDataDir"), { recursive: true, force: true });
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

          // await browser.close();
          console.info(
            `[${dateService.currentFormatDate()}] Aksi Selesai Dengan Kode ${paymentCodeText}`
          );
          console.info(
            `[${dateService.currentFormatDate()}] Aksi Selesai Dengan Pembayaran ${totalPrice}`
          );
          resolve(paymentCodeText);
        } catch (error) {
          reject(error);
        }
      }, 5000);
    });
  };
  const result = await resultDigiposPaymentCode();
  return result;
};

const getProductList = async (number) => {
  fs.rmSync(path.join(__dirname, "../myUserDataDir"), { recursive: true, force: true });
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
  const resultLists = cheerioService.getListPaketData(resultHtml)
  await browser.close();
  return resultLists;
};

const orderPaketWithVerify = async (number, idpaket, quota, price, textDescription) => {
  fs.rmSync(path.join(__dirname, "../myUserDataDir"), { recursive: true, force: true });
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
  console.info(`[${dateService.currentFormatDate()}] Aksi Validasi ProductId & Quota & Price`);
  // First Validation
  const content = await page.content();
  const results = cheerioService.getListPaketData(content);
  let matchDetailPaket;
  matchDetailPaket = results.filter((result) => {
    if (
      (result.productId === idpaket) &&
      (result.quota === quota) &&
      (result.price === price) &&
      (result.textDescription === textDescription)
    ) {
     return result;
    }
  });
  // Second Validation, if length of result < 1 getFullHtml again and matching
  if (results.length < 1) {
    console.info(`[${dateService.currentFormatDate()}] Masuk Aksi Validasi Ke 2 ProductId & Quota & Price karena hasil pertama checker ke 1 adalah 0`);
    const secondContent = await page.content();
    const secondResults = cheerioService.getListPaketData(secondContent);
    matchDetailPaket = secondResults.filter((result) => {
      if (
        (result.productId === idpaket) &&
        (result.quota === quota) &&
        (result.price === price) &&
        (result.textDescription === textDescription)
      ) {
       return result;
      }
    });
  }

  // If Details Packet is not match, close browser and print all packet
  if (matchDetailPaket < 1) {
    console.info(`[${dateService.currentFormatDate()}] Tidak ada data match`);
    console.info(`[${dateService.currentFormatDate()}] ${JSON.stringify(results)}`);
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

          // await browser.close();
          console.info(
            `[${dateService.currentFormatDate()}] Aksi Selesai Dengan Kode ${paymentCodeText}`
          );
          console.info(
            `[${dateService.currentFormatDate()}] Aksi Selesai Dengan Pembayaran ${totalPrice}`
          );
          resolve(paymentCodeText);
        } catch (error) {
          reject(error);
        }
      }, 5000);
    });
  };
  const result = await resultDigiposPaymentCode();
  return result;
};

// orderPaketWithVerify("085173292091", "50502", "1 GB", "5099");

module.exports = {
  orderPulsaByu,
  getProductList,
  orderPaketWithVerify,
};
