chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.executeScript(tab.id,{
        file: 'src/content/linkpagehost.js'
    }, function(results){
        if (chrome.runtime.lastError || !results || !results.length) {
            return;  // Permission error, tab closed, etc.
        }
        if (results[0] !== true) {
            chrome.tabs.insertCSS(tab.id,{file: 'src/content/linkpagehost.css'});
        }        
    });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'authenticate') {

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
        sendResponse({auth: "OK"});
      }).catch(function (err) {
        chrome.notifications.create({
          type: 'basic',
          title: 'Login Failed',
          message: err.message,
          iconUrl: 'icons/icon-128.png'
        });
        sendResponse(err);
      });
    
    return true; // Allow us to use sendResponse asynchronously
  }
});