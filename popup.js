// Initialize butotn with users's prefered color
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

document.getElementById("stop").onclick = async () => {
 
  chrome.tabs.query({}, function (tabs) {
    console.log(tabs)
    tabs.forEach(
      (tab) => tab.url &&  tab.url.includes("amazon") && chrome.tabs.remove(tab.id)
    );
  });
  await setLocalData({});
};
