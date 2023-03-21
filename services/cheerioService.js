const cheerio = require("cheerio");

const getListPaketData = (html) => {
  // Load Html To Cheerio Library
  const $ = cheerio.load(html);
  const lists = [];
  // Select All Card Paket Data And Get Content
  $(".m-predefined-pkg__item > .react-reveal.m-package-card.m-package-card--predefined.m-package-card--validity").each((idx, el) => {
    // Get Id From Input Checkbox
    const idWithText = $(el).children(".a-checkbox").children("input").attr("id");
    // Get Index 1 to apply productId
    const [,productId] = idWithText.split("cPredefinePckgBtnWeb");
    // Get Title Text Bold
    const titleTextBold = $(el)
      .children(".m-package-card__txt")
      .children("p.m-package-card__title")
      .text();
    // Get Quota And Periode With Mix Html
    const quotaAndPeriode = $(el)
      .children(".m-package-card__txt")
      .children(".a-title.m-package-card__quota")
      .html();
    // Get Quota and Active Periode(Mix span Tag)
    const [quota, activePeriodSpan] = quotaAndPeriode.split(`<span class="m-package-card__quota__period">`);
    // Get Active Periode
    const [activePeriod] = activePeriodSpan.split("</span>");
    // Get TextDescription
    const textDescription = $(el)
      .children(".m-package-card__txt")
      .children(".m-package-card__desc")
      .text(); 
    // Get Price
    const priceIdr = $(el)
      .children(".m-package-card__txt")
      .children("h2.a-title.m-package-card__price")
      .text();
    const [,priceWithDot] = priceIdr.split("Rp");
    const price = priceWithDot.split(".").join("").trim();
    lists.push({
      productId,
      titleTextBold,
      quota,
      activePeriod,
      textDescription,
      price,
    });
  });
  return lists;
};

// (async () => {
//   getListPaketData(htmlPayload);
// })()

module.exports = { getListPaketData };
