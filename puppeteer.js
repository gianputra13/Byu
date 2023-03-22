const puppeteer = require("puppeteer");

const OrderPulsaByu = async (number, idpaket) => {
  try {
    const browser = await puppeteer.launch({
      userDataDir: "./myUserDataDir",
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
    console.info(` Aksi Button Beli`);
    const buttonBuySelector = "#inputNumber ~ button";
    await page.waitForSelector(buttonBuySelector);
    await page.click(buttonBuySelector);

    // Click Tab Paket Data
    console.info(` Aksi Klik Tab Paket Data`);
    const selectorTabPaketData = "button[data-target='#pilih-paket']";
    await page.waitForSelector(selectorTabPaketData);
    await page.click(selectorTabPaketData, { delay: 1000 });

    // Cek Keranjang
    console.info(` Aksi Cek Isi Keranjang`);
    const value = ".m-cart__count span";
    await page.waitForSelector(value);
    const countValue = await page.evaluate(() => {
      const cartCountElement = document.querySelector(".m-cart__icon span");
      return cartCountElement.innerText;
    });

    // If Cart Available, Remove Item from cart
    console.info(` Total Cart ${countValue}`);
    if (countValue > 0) {
      console.info(` Aksi Masuk IF Total Cart ${countValue}`);
      // Click element keranjang
      console.info(` Aksi Klik Keranjang`);
      await page.evaluate(() => {
        const cartList = document.querySelector(".m-cart__card");
        cartList.click({ delay: 4000 });
      });

      // Get All Cart Items And Remove
      const minusButton = ".m-cart-item__right";
      await page.waitForSelector(minusButton);
      console.info(` Aksi Hapus Keranjang`);
      await page.evaluate(() => {
        const button = document.querySelector(
          `button[class="a-btn a-btn__clear a-btn--primary"]`
        );
        button.click({ delay: 5000 });
      });
    }

    // Click Paket Data
    setTimeout(async () => {
      console.info(` Aksi Menambahkan Paket Data Dengan ID ${idpaket}`);
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

    await page
      .waitForSelector(".m-popup-notif__txt", { timeout: 6000 })
      .then(async () => {
        console.log("Elemen Popup ditemukan");
        await page.waitForSelector("button.a-btn--primary");
        console.log("Tombol Okei! ditemukan");
        const buttonOke = "button[class='a-btn a-btn--primary']";
        await page.waitForSelector(buttonOke);
        await page.click(buttonOke, { delay: 2000 });
      })
      .catch((error) => {
        if (error.name === "TimeoutError") {
          console.log("Timeout: Elemen Popup tidak ditemukan setelah 30 detik");
        }
      });

    // Click Next To Payment Method
    console.info(` Aksi Klik Next Ke Payment Method`);
    const buttonSelector = ".m-cart__btn";
    await page.waitForSelector(buttonSelector);
    await page.evaluate(() => {
      const button = document.querySelector(
        'button[data-test-id="btnNextIrenew"]'
      );
      button.click({ delay: 1000 });
    });

    // Click Payment Method
    console.info(` Aksi Pilih Digipos`);
    const selectPaymentMethod = `#digipos`;
    await page.waitForSelector(selectPaymentMethod);
    await page.click(selectPaymentMethod, { delay: 1000 });

    // Click Next After Select Payment Method
    console.info(` Aksi Next After Select Payment Method`);
    const buttonNextPayment = `button[data-test-id='NextBtnWeb']`;
    await page.waitForSelector(buttonNextPayment);
    await page.click(buttonNextPayment, { delay: 3000 });

    // Get PaymentCode
    console.info(` Aksi Menunggu Kode Payment`);
    const paymentCodeSelector = ".m-payment-offline__detail--payment-code";
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
    console.info(` Aksi Selesai Dengan Kode ${paymentCodeText}`);
    console.info(` Aksi Selesai Dengan Pembayaran ${totalPrice}`);
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  await OrderPulsaByu("085172251181", 10851);
})();
