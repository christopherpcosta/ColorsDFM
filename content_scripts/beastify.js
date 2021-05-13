(function () {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  window.setInterval(() => {
    SetColorsToList();
    SetColorToCase(null);
    cleanExpired();
  }, 5000);

  function SetColorsToList() {

    let caseNumber = document.querySelectorAll("label");

    setColorsToElements(caseNumber, "innerHTML");
  }

  function SetColorToCase(color) {

    let caseNumber = document.querySelectorAll("div[aria-label]");

    let firstNumberFound = setColorsToElements(caseNumber, "ariaLabel");

    if (color != null) {
      let databaseColorKey = "COLOR_" + firstNumberFound;

      chrome.storage.sync.set({
        [databaseColorKey]: {
          'color': color,
          'timestamp': Date.now()
        }
      },
        function () {
          console.log("New color " + color + " set to " + firstNumberFound);
        });

      setColorsToElements(caseNumber, "ariaLabel");
    }
  }

  function setColorsToElements(htmlElements, whereToLook) {
    for (let element of htmlElements) {

      let possibleNumber = null;

      if (whereToLook == "innerHTML")
        possibleNumber = element.innerHTML;
      if (whereToLook == "ariaLabel")
        possibleNumber = element.ariaLabel;

      let isNumberMatch = null;

      isNumberMatch = possibleNumber.match(/\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d/);

      if (isNumberMatch == null)
        isNumberMatch = possibleNumber.match(/CAS-/);

      if (isNumberMatch != null) {
        let databaseColorKey = "COLOR_" + isNumberMatch[0];

        chrome.storage.sync.get([databaseColorKey], function (result) {
          if (result.hasOwnProperty(databaseColorKey)) {
            element.style.backgroundColor = result[databaseColorKey].color;
            if (result[databaseColorKey] == 'Black') {
              element.style.color = 'white'
            }
            else {
              element.style.color = 'black'
            }
          }
        });

        if (whereToLook == "ariaLabel")
          return isNumberMatch[0];
      }
    }
  }

  function cleanExpired() {
    chrome.storage.sync.get(null, function (result) {
      Object.keys(result).forEach(key => {
        if (new Date(result[key].timestamp) < Date.now() - (86400000 * 60)) {
          chrome.storage.sync.remove(key)
        }
      });
    });
  }

  chrome.runtime.onMessage.addListener((message) => {
    SetColorToCase(message.command);
  });

})();
