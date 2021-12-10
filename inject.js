function injectScript(file, node) {
  var th = document.getElementsByTagName(node)[0];
  var s = document.createElement("script");
  s.setAttribute("type", "text/javascript");
  s.setAttribute("src", file);
  th.appendChild(s);
}
function injectButton(text, node) {
  var th = document.getElementsByTagName(node)[0];
  var s = document.createElement("button");
  s.innerText  =  text;
  s.setAttribute("style", `    position: fixed;
  top: 10vh;
  font-weight: bold;
  padding: 10px 20px;
  right: 2vw;
  background: #377988;
  z-index:9999;
  outline: none;
  border: none;
  border: 1px dashed yellow;
  color: white;
  cursor: pointer;`);
  s.setAttribute("id", "actionButton");
  th.appendChild(s);
}
function injectButton_2(text, node) {
  var th = document.getElementsByTagName(node)[0];
  var s = document.createElement("button");
  s.innerText  =  text;
  s.setAttribute("style", `    position: fixed;
  top: 15vh;
  font-weight: bold;
  padding: 10px 20px;
  right: 2vw;
  background: maroon;
  z-index:9999;
  outline: none;
  border: none;
  border: 1px dashed yellow;
  color: white;
  cursor: pointer;`);
  s.setAttribute("id", "actionButton_2");
  th.appendChild(s);
}
function injectLabel(text, node) {
  var th = document.getElementsByTagName(node)[0];
  var s = document.createElement("span");
  s.innerText  =  text;
  s.setAttribute("style", `position: fixed;
  top: 15vh;
  font-weight: bold;
  padding: 10px 20px;
  right: 2vw; 
  z-index:9999;
  outline: none;
  border: none;
  border: 1px dashed yellow;
  color: maroon;
  cursor: pointer;`);
  s.setAttribute("id", "actionLabel");
  th.appendChild(s);
}
injectScript(chrome.runtime.getURL("runner.js"), "body");
injectButton("SCRAPE NOW", "body");
// injectButton_2("STOP", "body");
// injectLabel("Status", "body");
