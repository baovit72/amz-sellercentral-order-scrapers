console.log("runner 1")
location.href.includes(".uk/properties/") && window.addEventListener("load", async function () {
  while (!window.PAGE_MODEL) {
    await sleep(2000);
  }
  const addressElement = document.querySelector('h1[itemProp="streetAddress"]');
  /*UPDATE LOADING*/
  const originalAddress = addressElement.innerText;
  addressElement.innerText = "... " + originalAddress;
  /*MAIN*/
  const address = window.PAGE_MODEL.propertyData.address;
  !address.deliveryPointId &&
    (addressElement.innerText = "ⓧ " + originalAddress);
  const post_code = address.outcode + "-" + address.incode;
  const dataHistory = await getHistoryOfHouse(address);
  !dataHistory.soldPropertyTransactionHistories &&
    dataHistory.soldPropertyTransactionHistories.length === 0 &&
    (addressElement.innerText = "ⓧ " + originalAddress);
  const houseTransaction = dataHistory.soldPropertyTransactionHistories
    .map((transaction) => transaction.soldPrice + "_" + transaction.year)
    .join("-");
  houseTransaction.trim().length === 0 &&
    (addressElement.innerText = "ⓧ " + originalAddress);

  console.log(houseTransaction);
  const rawLocationHtml = await getLocationIDRaw(post_code);
  const locId = /POSTCODE\^(\d+)/.exec(rawLocationHtml)[1];
  const firstPageData = await getHistoryOfLocation(locId);
  const pageNum = firstPageData.pagination.last;
  const rawTransactions = firstPageData.results.properties;
  for (var i = 2; i <= pageNum; i++) {
    rawTransactions.push((await getHistoryOfLocation(i)).results.properties);
  }
  const transactions = rawTransactions.map((item) => ({
    address: item.address,
    transaction:
      (item.transactions &&
        item.transactions
          .map(
            (transaction) =>
              transaction.displayPrice +
              "_" +
              transaction.dateSold.split(" ")[2]
          )
          .join("-")) ||
      "",
  }));
  const matchTransaction = transactions.find(
    (transaction) => houseTransaction.trim() === transaction.transaction
  );
  console.log(transactions);
  console.log(matchTransaction);
  /*UPDATE RESULT*/
  matchTransaction &&
    matchTransaction.address &&
    (addressElement.innerText = matchTransaction.address);
});
const getLocationIDRaw = (postcode) => {
  console.log("fetching");
  return new Promise((resolve, reject) => {
    fetch(`https://www.rightmove.co.uk/house-prices/${postcode}`)
      .then((res) => res.text())
      .then((data) => resolve(data));
  });
};
const getHistoryOfHouse = ({ deliveryPointId }) => {
  console.log("fetching");
  return new Promise((resolve, reject) => {
    fetch(
      `https://www.rightmove.co.uk/properties/api/soldProperty/transactionHistory/${deliveryPointId}`
    )
      .then((res) => res.json())
      .then((data) => resolve(data));
  });
};
const getHistoryOfLocation = (locId) => {
  console.log("fetching");
  return new Promise((resolve, reject) => {
    fetch(
      `https://www.rightmove.co.uk/house-prices/result?locationType=POSTCODE&locationId=${locId}&page=1`
    )
      .then((res) => res.json())
      .then((data) => resolve(data));
  });
};
const sleep = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
};
