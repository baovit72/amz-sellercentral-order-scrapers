
location.href.includes("find.html") && window.addEventListener("load", async function () {
  /*MAIN*/
  const processItem = async (url)=>{     
    const address = JSON.parse("{"+/\"address\".+?}/.exec((await getHouseDetailRaw(url)).replaceAll(" ","").replaceAll("\n",""))+"}").address; 
    const post_code = address.outcode + "-" + address.incode;
    const dataHistory = await getHistoryOfHouse_2(address);
    const houseTransaction = dataHistory.soldPropertyTransactionHistories
      .map((transaction) => transaction.soldPrice + "_" + transaction.year)
      .join("-");
    const rawLocationHtml = await getLocationIDRaw_2(post_code);
    const locId = /POSTCODE\^(\d+)/.exec(rawLocationHtml)[1];
    const firstPageData = await getHistoryOfLocation_2(locId);
    const pageNum = firstPageData.pagination.last;
    const rawTransactions = firstPageData.results.properties;
    for (var i = 2; i <= pageNum; i++) {
      rawTransactions.push((await getHistoryOfLocation_2(i)).results.properties);
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
    return matchTransaction.address;
  }
  console.log("begin")
  while (!document.getElementsByClassName("propertyCard-details").length) {
    await sleep_2(2000);
  }
  const cards =  document.getElementsByClassName("propertyCard-details");
  for(var i=0; i<cards.length; i++) {
    try{
      const card = cards[i];
      const initAddress = card.querySelector("address[class='propertyCard-address']").innerText ;
      try{ 
        card.querySelector("address[class='propertyCard-address']").innerText  = "... " + initAddress ;
        const url = card.querySelector("a[class='propertyCard-link']").href; 
        const address = await processItem(url);
        address ? (card.querySelector("address[class='propertyCard-address']").innerText = address) : (card.querySelector("address[class='propertyCard-address']").innerText = "ⓧ " + initAddress); 
      }
      catch (e){
        console.log(e);
        card.querySelector("address[class='propertyCard-address']").innerText  = "ⓧ " + initAddress ;
      }
    }
    catch{

    }
   
  }
  

});
const getLocationIDRaw_2 = (postcode) => {
  console.log("fetching");
  return new Promise((resolve, reject) => {
    fetch(`https://www.rightmove.co.uk/house-prices/${postcode}`)
      .then((res) => res.text())
      .then((data) => resolve(data));
  });
};
const getHouseDetailRaw = (url) => {
  console.log("fetching");
  return new Promise((resolve, reject) => {
    fetch(`${url}`)
      .then((res) => res.text())
      .then((data) => resolve(data));
  });
};
const getHistoryOfHouse_2 = ({ deliveryPointId }) => {
  console.log("fetching");
  return new Promise((resolve, reject) => {
    fetch(
      `https://www.rightmove.co.uk/properties/api/soldProperty/transactionHistory/${deliveryPointId}`
    )
      .then((res) => res.json())
      .then((data) => resolve(data));
  });
};
const getHistoryOfLocation_2 = (locId) => {
  console.log("fetching");
  return new Promise((resolve, reject) => {
    fetch(
      `https://www.rightmove.co.uk/house-prices/result?locationType=POSTCODE&locationId=${locId}&page=1`
    )
      .then((res) => res.json())
      .then((data) => resolve(data));
  });
};
const sleep_2 = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
};
