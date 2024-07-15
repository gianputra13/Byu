// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");
const { Logging } = require("./utils/logging.utils");

let PUPPETER_PAGE;
let identity = null;

const ID_ONE = "https://www.byu.id/v2/i-renew/input-nomor";
const ID_TWO = "https://www.byu.id/v2/assets/img/bg/input-number.svg";
const ID_THREE = "https://www.byu.id/v2/i-renew/payment";

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

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
  const waitTime = 3000;
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

async function pickPaymentMethod(elementId) {
  const TAG = pickPaymentMethod.name;
  Logging.INFO(TAG, "Start Action");
  const paymentMethodSelector = "input#briva";
  await PUPPETER_PAGE.waitForSelector(paymentMethodSelector);
  await PUPPETER_PAGE.click(paymentMethodSelector);
  Logging.INFO(TAG, "End action");
}

// puppeteer usage as normal
puppeteer
  .launch({
    headless: false,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  })
  .then(async (browser) => {
    PUPPETER_PAGE = await browser.newPage();
    await PUPPETER_PAGE.setRequestInterception(true);

    // Handle each request
    PUPPETER_PAGE.on("request", (request) => {
      request.continue();
    });

    PUPPETER_PAGE.on("response", async (response) => {
      const responseUrl = response.url();
      try {
        if (
          responseUrl !== "https://api.byu.id/api/irenew-web/order" &&
          identity !== "https://www.byu.id/v2/i-renew/payment"
        )
          return;
        const responseBody = await response.json();

        if (responseBody.data.hasOwnProperty("payment_detail")) {
          if (responseBody.data.payment_detail.length > 0) {
            console.log("Browser close....");
            browser.close();
            console.log("Response Body:", responseBody);
          }
        }
      } catch (error) {
        // console.error('Error:', error);
      }
    });

    // Event listener untuk memantau status loading
    PUPPETER_PAGE.on("load", async () => {
      const TAG = "OnPageLoaded";
      console.log("Halaman telah sepenuhnya dimuat:", PUPPETER_PAGE.url());
      const currentUrl = PUPPETER_PAGE.url();
      switch (currentUrl) {
        case ID_ONE:
          console.log({ identity });
          if (identity === ID_ONE) break;
          identity = ID_ONE;
          Logging.WARNING(TAG, "ID_ONE");
          await submitNumberAndBuy("085173292091");
          break;
        default:
          break;
      }
    });

    PUPPETER_PAGE.on("domcontentloaded", () => {
      console.log("DOM sepenuhnya dimuat:", PUPPETER_PAGE.url());
    });

    // Handle request finished
    PUPPETER_PAGE.on("requestfinished", async (request) => {
      const TAG = "RequestFinish";
      const requestUrl = request.url();
      // console.log({ requestUrl })
      switch (requestUrl) {
        case ID_ONE:
          // console.log({ identity });
          // if (identity === ID_ONE) break;
          // identity = ID_ONE;
          // Logging.WARNING(TAG, "ID_ONE");
          // await submitNumberAndBuy("085173292091");
          break;
        case ID_TWO:
          console.log({ identity });
          if (identity === ID_TWO) break;
          identity = ID_TWO;
          Logging.WARNING(TAG, "ID_TWO");
          const changeFinish = await changeTabToPulsaPage();
          if (changeFinish) {
            const pickFinish = await pickNominalPulsa("cCrdtIrnwId10000");
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
          await pickPaymentMethod();
          await clickCheckoutCart();
          break;
      }
    });

    await PUPPETER_PAGE.goto("https://www.byu.id/v2/i-renew/input-nomor");
    // await submitNumberAndBuy("085173292091")
    // await changeTabToPulsaPage()
  });

// orderPulsaByu("085173292091", "50502");
