var SERVICE_URL = env.DEBUG ? env.DEBUG_SERVICE_ENDPOINT : env.SERVICE_ENDPOINT;

// Minimal jQuery
const $$ = document.querySelectorAll.bind(document);
const $  = document.querySelector.bind(document);

function getCurrentTabInfo(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    var tab = tabs[0];
    callback({ url: tab.url, title: tab.title });
  });
}

function savePage() {
  var page = {}
    , category = document.getElementById('linkCategory');

  page.link = {};
  page.link.longUrl = document.getElementById('linkUrl').value;

  page.title = document.getElementById('linkTitle').value;
  page.author = document.getElementById('linkAuthor').value;
  if (category.value != "None") {
    page.category = category.value;
  }

  fetch(SERVICE_URL, {
    method: 'post',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(page)
  }).then(function(response) {
    window.close();
  });
}

function renderForm(){
  getCurrentTabInfo((pageInfo) => {
    var save = document.getElementById('save');

    document.getElementById('linkUrl').value = pageInfo.url;
    document.getElementById('linkTitle').value = pageInfo.title;

    save.addEventListener('click', savePage);
  });
}

function renderAuth(){
  $('#auth').classList.remove('hidden');
  $('#linkInfo').classList.add('hidden');
  $('#spinner').classList.add('hidden');
}

function main() {
  const authResult = JSON.parse(localStorage.authResult || '{}');
  const token = authResult.id_token;
  if (token && isLoggedIn(token)) {
    renderForm(authResult);
  } else {
    renderAuth();
  }
}

document.addEventListener('DOMContentLoaded', main);
