const puppeteer = require("puppeteer");

const OrderPulsaByu = async (nominal, name) => {
  console.log(`button[data-test-id="deleteItemKeranjang${name}"]`);
  try {
    const browser = await puppeteer.launch({
      userDataDir: "./myUserDataDir",
      headless: false,
    });
    const page = await browser.newPage();

    await page.goto("https://www.byu.id/v2/i-renew/input-nomor");

    await page.type("#inputNumber", "085173292091");

    // Click Button Buy
    const buttonBuySelector = "#inputNumber ~ button";
    await page.waitForSelector(buttonBuySelector);
    await page.click(buttonBuySelector);

    // Click Tab Menu Pulsa
    const buttonMenuPulsa = "button[data-target='#pilih-pulsa']";
    await page.waitForSelector(buttonMenuPulsa);
    await page.click(buttonMenuPulsa, { delay: 500 });

    // Cek Keranjang
    const cartCountElement = await page.$(".m-cart__count span");
    const cartCountText = await page.evaluate(
      (cartCountElement) => cartCountElement.textContent,
      cartCountElement
    );
    if (cartCountText >= 1) {
      // Click element keranjang
      const cartSelector = ".m-cart__card";
      await page.waitForSelector(cartSelector);
      await page.click(cartSelector, { delay: 1000 });

      const minusButton = ".m-cart-item__right";
      await page.waitForSelector(minusButton);
      await page.evaluate((name) => {
        const button = document.querySelector(
          `button[data-test-id="deleteItemKeranjang${name}"]`
        );
        button.click({ delay: 2000 });
      });

      // Click Nominal Pulsa
      const buttonSelectNominal = `#cCrdtIrnwId${nominal}`;
      await page.waitForSelector(buttonSelectNominal, {
        waitUntil: "networkidle0",
      });
      await page.evaluate((buttonSelectNominal) => {
        const checkbox = document.querySelector(buttonSelectNominal);
        if (checkbox) {
          checkbox.click();
        }
      }, buttonSelectNominal);
    }

    // Click Next To Payment Method
    const buttonSelector = ".m-cart__btn";
    await page.waitForSelector(buttonSelector);
    await page.evaluate(() => {
      const button = document.querySelector(
        'button[data-test-id="btnNextIrenew"]'
      );
      button.click({ delay: 2000 });
    });

    // Click Payment Method
    const selectPaymentMethod = `#digipos`;
    await page.waitForSelector(selectPaymentMethod);
    await page.click(selectPaymentMethod, { delay: 500 });

    // Click Next After Select Payment Method
    const buttonNextPayment = `button[data-test-id='NextBtnWeb']`;
    await page.waitForSelector(buttonNextPayment);
    await page.click(buttonNextPayment, { delay: 3000 });

    // Get PaymentCode
    const paymentCodeSelector = ".m-payment-offline__detail--payment-code";
    await page.waitForSelector(paymentCodeSelector);
    const paymentCode = await page.$(paymentCodeSelector);
    console.log(paymentCode); // Cetak nilai paymentcode
    const paymentCodeText = await page.evaluate(
      (el) => el.textContent,
      paymentCode
    );
    console.log(paymentCodeText);

    await browser.close();
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  await OrderPulsaByu(20000, "Pulsa1");
})();
