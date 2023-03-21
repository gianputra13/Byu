const puppeteer = require("puppeteer");
const dateService = require("./dateService");
const path = require("path");

const orderPulsaByu = async (number, idpaket) => {
  const browser = await puppeteer.launch({
    userDataDir: path.join(__dirname, "../myUserDataDir"),
    headless: false,
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
  await page.type("#inputNumber", number);

  // Click Button Buy
  console.info(`[${dateService.currentFormatDate()}] Aksi Button Beli`);
  const buttonBuySelector = "#inputNumber ~ button";
  await page.waitForSelector(buttonBuySelector);
  await page.click(buttonBuySelector);

  // Cek Keranjang
  console.info(`[${dateService.currentFormatDate()}] Aksi Cek Isi Keranjang`);
  const countValue = await page.evaluate(() => {
    const countElement = document.querySelector(".m-cart__count span");
    return countElement ? parseInt(countElement.textContent) : 0;
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
      cartList.click();
    });

    // Get All Cart Items And Remove
    const minusButton = ".m-cart-item__right";
    await page.waitForSelector(minusButton);
    await page.evaluate(() => {
      const button = document.querySelector(
        `button[data-test-id="deleteItemKeranjangPulsa1"]`
      );
      button.click({ delay: 3000 });
    });
    // setTimeout(async () => {
    //   for (let i = 0; i < cartCountText; i++) {
    //     console.info(
    //       `[${dateService.currentFormatDate()}] Aksi Hapus Keranjang ${i}`
    //     );
    //     await page.waitForSelector(
    //       ".m-cart-item__list > .m-cart-item__right button"
    //     );
    //     await page.click(".m-cart-item__list > .m-cart-item__right button");
    //   }
    // }, 1000);
  }

  // Click Nominal Pulsa
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
        checkbox.click();
      }
    }, buttonSelectPaketData);
  }, 2000);

  // Await Digipos Payment Code With SetTimeout
  const resultDigiposPaymentCode = () => {
    console.info(
      `[${dateService.currentFormatDate()}] Aksi Fungsi Get Payment Code`
    );
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // console.info(`[${dateService.currentFormatDate()}] Aksi Acc Pop Up Error`);
          // Button Close When Oops
          // const buttonClose = "#__next > div > div.o-popup.o-popup--show.o-popup--sm > div > div > div > div.m-popup-notif__actions > button";
          // await page.waitForSelector(buttonClose);
          // await page.click(buttonClose);

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
          await page.click(selectPaymentMethod, { delay: 500 });

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

          await browser.close();
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


const getFullHtmlProductList = async (number) => {
  const browser = await puppeteer.launch({
    userDataDir: path.join(__dirname, "../myUserDataDir"),
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
  console.info(`[${dateService.currentFormatDate()}] Aksi Tunggu Element Loaded`);
  const resultHtml = await new Promise((resolve, reject) => {
    setTimeout(async () => {
      const resultRes = await page.content();
      resolve(resultRes)
    }, 4000)
  });
  await browser.close();
  return resultHtml;
};

module.exports = { orderPulsaByu, getFullHtmlProductList };
