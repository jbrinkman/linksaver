(function () {
  function ScriptExecution(tabId) {
    this.tabId = tabId;
  }

  ScriptExecution.prototype.executeScripts = function (fileArray) {
    fileArray = Array.prototype.slice.call(arguments); // ES6: Array.from(arguments)
    return Promise.all(fileArray.map(file => exeScript(this.tabId, file))).then(() => this); // 'this' will be use at next chain
  };

  ScriptExecution.prototype.executeCodes = function (fileArray) {
    fileArray = Array.prototype.slice.call(arguments);
    return Promise.all(fileArray.map(code => exeCodes(this.tabId, code))).then(() => this);
  };

  ScriptExecution.prototype.injectCss = function (fileArray) {
    fileArray = Array.prototype.slice.call(arguments);
    return Promise.all(fileArray.map(file => exeCss(this.tabId, file))).then(() => this);
  };

  function promiseTo(fn, tabId, info) {
    return new Promise(resolve => {
      fn.call(chrome.tabs, tabId, info, x => resolve());
    });
  }

  function exeScript(tabId, path) {
    let info = { file: path, runAt: 'document_end' };
    return promiseTo(chrome.tabs.executeScript, tabId, info);
  }

  function exeCodes(tabId, code) {
    let info = { code: code, runAt: 'document_end' };
    return promiseTo(chrome.tabs.executeScript, tabId, info);
  }

  function exeCss(tabId, path) {
    let info = { file: path, runAt: 'document_end' };
    return promiseTo(chrome.tabs.insertCSS, tabId, info);
  }

  window.ScriptExecution = ScriptExecution;
})()

window.LinkSaverAuth = false;

chrome.browserAction.onClicked.addListener(function (tab) {

  new ScriptExecution(tab.id)
    .executeScripts('src/shared/constants.js', 'src/content/linkpagehost.js')
    .then(s => s.injectCss('src/content/styles/linkpagehost.css'));

});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === messageType.Auth && !window.LSAuthenticating) {
    window.LSAuthenticating = true;

    // scope
    //  - openid if you want an id_token returned
    //  - offline_access if you want a refresh_token returned
    //  - profile if you want an additional claims like name, nickname, picture and updated_at.
    // device
    //  - required if requesting the offline_access scope.
    let options = {
      scope: 'openid profile offline_access',
      device: 'chrome-extension'
    };

    new Auth0Chrome(env.AUTH0_DOMAIN, env.AUTH0_CLIENT_ID)
      .authenticate(options)
      .then(function (authResult) {
        localStorage.authResult = JSON.stringify(authResult);
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon-128.png',
          title: 'Login Successful',
          message: 'You can use the app now'
        });
        sendResponse({ auth: messageType.AuthOk });
      }).catch(function (err) {
        chrome.notifications.create({
          type: 'basic',
          title: 'Login Failed',
          message: err.message,
          iconUrl: 'icons/icon-128.png'
        });
        sendResponse(err);
      }).finally(() => {
        window.LSAuthenticating = false;
      });
  } else if (request.type === messageType.Save) {
    var SERVICE_URL = env.DEBUG ? env.DEBUG_SERVICE_ENDPOINT : env.SERVICE_ENDPOINT,
      responseMessage = {};
    fetch(SERVICE_URL, {
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, *//*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request.page)
    }).then(function (response) {
      chrome.notifications.create({
        type: 'basic',
        title: 'Save Complete',
        message: 'Another link saved.',
        iconUrl: 'icons/icon-128.png'  
      });
      responseMessage = {saved: messageType.SaveOk};
    }).catch((err) => {
      chrome.notifications.create({
        type: 'basic',
        title: 'Save Failed',
        message: err.message,
        iconUrl: 'icons/icon-128.png'
      });
      responseMessage = err
    }).finally(() => {
      sendResponse(responseMessage);
    });
  }
  return true; // Allow us to use sendResponse asynchronously
});