/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", function (e) {

    /**
     * Insert the page-hiding CSS into the active tab,
     * then get the beast URL and
     * send a "beastify" message to the content script in the active tab.
     */
    function beastify(tabs, color) {
      console.log(tabs);

      chrome.tabs.sendMessage(tabs[0].id, {
        command: color
      });
    }

    /**
     * Get the active tab,
     * then call "beastify()"
     */
    if (e.target.classList.contains("beast")) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        beastify(tabs, e.target.innerHTML);
      });
      return;
    }
  });

}


/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 */
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  if (tabs[0].url == "https://onesupport.crm.dynamics.com/main.aspx?appid=101acb62-8d00-eb11-a813-000d3a8b3117") {
    chrome.tabs.executeScript({ file: "/content_scripts/beastify.js" });
    listenForClicks();
  }
});

