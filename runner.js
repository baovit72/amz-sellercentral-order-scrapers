/** SCRAPER_DATA
 * currentIndex
 * status running - init
 * data
 */

const jsonAPI = "http://jsonblob.com/api/jsonBlob/890821801681371136";
console.log("runner");
(async () => {
  while (!document.getElementById("actionButton")) {
    await sleep(1000);
  }
})();
const onClickScrape = async () => {
  console.log("clicked scraping");
  let data = await getLocalData();
  data = { currentIndex: 0, status: "init", merchants: [], orders: [] };
  await setLocalData(data);
  await init();
};

const getLocalData = () => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      "https://jsonblob.com/api/jsonBlob/890836991147786240",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => resolve(result))
      .catch((error) => console.log("error", error));
  });
};
const setLocalData = (data) => {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: JSON.stringify(data),
      redirect: "follow",
    };
    fetch(
      "https://jsonblob.com/api/jsonBlob/890836991147786240",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => resolve(result))
      .catch((error) => console.log("error", error));
  });
};

const localStorageHandler = async () => {
  const data = await getLocalData();
  console.log(data);
  switch (data.status) {
    case "running":
      running();
      break;
  }
};
const wrap = (content) => '"' + content + '"';
const objectToCsvLine = (object) => {
  console.log("export to csv line");
  console.log(object);
  return [
    object.accountName,
    object.marketName,
    object.amazonOrderId,
    wrap(new Date(object.orderDate * 1000).toISOString()),
    wrap(new Date(object.earliestDeliveryDate * 1000).toISOString()),
    object.salesChannel,
    wrap(object.sellerSku),
    wrap(object.productName),
    object.quantityOrdered,
    object.unitPrice.CurrencyCode,
    object.unitPrice.Amount,
    wrap(object.address.name),
    wrap(object.address.line1),
    wrap(object.address.line2),
    wrap(object.address.city),
    wrap(object.address.stateOrRegion),
    wrap(object.address.postalCode),
    wrap(object.address.countryCode),
    object.address.phoneNumber,
    wrap(object.imageUrl),
    wrap(object.productLink),
  ].join(",");
};
const titles = [
  "Account",
  "Market Place",
  "Order No",
  "Purchase Date",
  "Delivery Date",
  "Sales Channel",
  "SKU",
  "Title",
  "Quantity",
  "Currency",
  "Price",
  "Full name",
  "Address Line1",
  "Address Line2",
  "City",
  "State",
  "Pincode",
  "Country",
  "Phone",
  "Image URL",
  "Product Lisiting URL",
];
const exportToCsv = (orders) => {
  console.log("export to csv");
  const csvContent = [
    titles,
    ...orders.map((order) => objectToCsvLine(order)),
  ].join("\n");
  console.log(csvContent);
  var encodedUri = URL.createObjectURL(new Blob(["\ufeff", csvContent]));
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "unshipped.csv");
  document.body.appendChild(link);
  link.click();
};
//SE@656%&#
const running = async () => {
  /*accountName, marketName, amazonOrderId, orderDate, earliestDeliveryDate, 
  salesChannel, orderItems.sellerSku,orderItems.productName, orderItems.quantityOrdered, 
  orderItems.unitPrice.CurrencyCode, orderItems.unitPrice.Amount, address.name, address.line1, address.line2, 
  address.city, address.stateOrRegion, address.postalCode, address.countryCode, address.phoneNumber, 
  orderItems.imageUrl, orderItems.productLink
  */
  const data = await getLocalData();
  console.log("currentData", data);
  const merchant = data.merchants[data.currentIndex];
  if (!merchant) {
    data.status = "init";
  } else {
    try {
      const orders = await getAllOrders(merchant);
      const orders_1 = orders.map((order) => ({
        ...order,
        accountName: merchant.name,
        marketName: merchant.marketplaceName,
      }));
      const orders_2 = [].concat.apply(
        [],
        orders_1.map((order) =>
          order.orderItems.map((item) => ({ ...order, ...item }))
        )
      );
      data.orders.push(...orders_2);
    } catch (e) {
      console.log(e);
    }
    data.currentIndex++;
    await setLocalData(data);
    if (data.merchants.length === data.currentIndex + 1) {
      exportToCsv(data.orders);
      await setLocalData({});
      alert("DONE");
    } else switchToMerchant(data.merchants[data.currentIndex]);
  }
};
const switchToMerchant = (merchant) => {
  console.log(
    "switching to ...",
    getSwitchRegionUrl(
      merchant.marketplaceName,
      merchant.directedId,
      merchant.merchantDirectId,
      merchant.marketplaceId
    )
  );
  window.location.href = getSwitchRegionUrl(
    merchant.marketplaceName,
    merchant.directedId,
    merchant.merchantDirectId,
    merchant.marketplaceId
  );
  // window.location.href = getSwitchRegionUrl(merchant.marketplaceName, merchant.directedId, merchant.merchantDirectId, merchant.marketplaceId);
};
const init = async () => {
  const data = await getLocalData();
  const merchants = (await getMerchants()).partnerAccounts;
  for (let i = 0; i < merchants.length; i++) {
    merchants[i].merchantMarketplaces = await getMerchantMarketPlaces(
      merchants[i].id
    );
  }
  console.log("after fix", merchants);
  const parsedMerchants = [].concat
    .apply(
      [],
      merchants.map((merchant) =>
        merchant.merchantMarketplaces.map((market) => ({
          ...market,
          merchantDirectId: market.directedId,
          directedId: merchant.directedId,
          name: merchant.name,
        }))
      )
    )
    .filter((item) =>
      ["United States", "United Kingdom", "India"].includes(
        item.marketplaceName.trim()
      )
    );
  data.merchants = parsedMerchants;
  data.status = "running";
  await setLocalData(data);
  await sleep(3000);
  switchToMerchant(data.merchants[0]);
};

const region = {
  US: {
    domain: "https://sellercentral.amazon.com/",
  },
  UK: {
    domain: "https://sellercentral.amazon.co.uk/",
  },
  IN: {
    domain: "https://sellercentral.amazon.in/",
  },
};
const getDomain = () => {
  if (location.href.includes(".amazon.com")) return region.US.domain;
  else if (location.href.includes(".amazon.co.uk")) return region.UK.domain;
  else return region.IN.domain;
};
const getDomainByRegion = (regionName) => {
  switch (regionName) {
    case "United States":
      return region.US.domain;
    case "United Kingdom":
      return region.UK.domain;
    default:
      return region.IN.domain;
  }
};
const getSwitchRegionUrl = (
  regionName,
  directId,
  merchantDirectId,
  marketplaceId
) => {
  return (
    getDomainByRegion(regionName) +
    `/home?mons_sel_dir_mcid=${merchantDirectId}&mons_sel_mkid=${marketplaceId}&mons_sel_dir_paid=amzn1.pa.d.${directId}`
  );
};

const getMerchants = () => {
  return new Promise((resolve, reject) => {
    fetch(getDomain() + "global-picker/data/get-partner-accounts", {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9,vi;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/json",
        pragma: "no-cache",
        "sec-ch-ua":
          '"Microsoft Edge";v="93", " Not;A Brand";v="99", "Chromium";v="93"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      referrerPolicy: "strict-origin-when-cross-origin",
      body: '{"delegationContext":"","pageSize":10}',
      method: "POST",
      mode: "cors",
      credentials: "include",
    })
      .then((data) => data.json())
      .then((data) => resolve(data));
  });
};
const getMerchantMarketPlaces = (merchantId) => {
  return new Promise((resolve, reject) => {
    fetch(
      getDomain() +
        "global-picker/data/get-merchant-marketplaces-for-partner-account",
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9,vi;q=0.8",
          "cache-control": "no-cache",
          "content-type": "application/json",
          pragma: "no-cache",
          "sec-ch-ua":
            '"Microsoft Edge";v="93", " Not;A Brand";v="99", "Chromium";v="93"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        body: `{"delegationContext":"","partnerAccountId":"${merchantId}"}`,
        method: "POST",
        mode: "cors",
        credentials: "include",
      }
    )
      .then((data) => data.json())
      .then((data) => resolve(data.merchantMarketplaces));
  });
};
//Mass order getters
const m_getOrderDetail = async (orders) => {
  const result = [];
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    result.push({
      ...order,
      address: (
        await getAddressDetail(
          (
            await getOrderDetail(order.amazonOrderId)
          ).order.blob
        )
      )[order.amazonOrderId].address,
    });
  }
  return result;
};
const getAllOrders = async () => {
  let offset = 0;
  let result = [];
  let orders = (await getOrders(offset)).orders;
  result.push(...(await m_getOrderDetail(orders)));
  while (orders.length) {
    offset += 15;
    orders = (await getOrders(offset)).orders;
    result.push(...(await m_getOrderDetail(orders)));
  }
  return result;
};
const getOrders = (offset) => {
  return new Promise((resolve, reject) => {
    fetch(
      getDomain() +
        `/orders-api/search?limit=15&offset=${offset}&sort=ship_by_asc&date-range=last-7&fulfillmentType=mfn&orderStatus=unshipped&forceOrdersTableRefreshTrigger=false`,
      {
        headers: {
          accept: "application/json",
          "accept-language": "en-US,en;q=0.9,vi;q=0.8",
          "anti-csrftoken-a2z-request": "true",
          "content-type": "application/json",
          "sec-ch-ua":
            '"Microsoft Edge";v="93", " Not;A Brand";v="99", "Chromium";v="93"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
        },
        referrer:
          "https://sellercentral.amazon.in/orders-v3/ref=xx_myo_dnav_xx?page=1",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    )
      .then((data) => data.json())
      .then((data) => resolve(data));
  });
};
const getAddressDetail = (blob) => {
  return new Promise((resolve, reject) => {
    fetch(getDomain() + "orders-st/resolve", {
      headers: {
        accept: "application/json",
        "accept-language": "en-US,en;q=0.9,vi;q=0.8",
        "content-type": "application/json",
        "sec-ch-ua":
          '"Microsoft Edge";v="93", " Not;A Brand";v="99", "Chromium";v="93"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
      },
      referrer:
        "https://sellercentral.amazon.in/orders-v3/order/405-1856318-3832328",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: `{\"blobs\":[\"${blob}\"]}`,
      method: "POST",
      mode: "cors",
      credentials: "include",
    })
      .then((data) => data.json())
      .then((data) => resolve(data));
  });
};
const getOrderDetail = (id) => {
  return new Promise((resolve, reject) => {
    fetch(getDomain() + `/orders-api/order/${id}`, {
      headers: {
        accept: "application/json",
        "accept-language": "en-US,en;q=0.9,vi;q=0.8",
        "anti-csrftoken-a2z-request": "true",
        "content-type": "application/json",
        "sec-ch-ua":
          '"Microsoft Edge";v="93", " Not;A Brand";v="99", "Chromium";v="93"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
      },
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    })
      .then((data) => data.json())
      .then((data) => resolve(data));
  });
};

const sleep = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
};

/*MAIN*/

document.getElementById("actionButton").onclick = onClickScrape;
localStorageHandler();
