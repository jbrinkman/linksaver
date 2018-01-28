// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var DEBUG = true;
var SERVICE_URL = DEBUG ? 'http://localhost:8080': 'https://wt-04d2752e1e94e431f2b22c742d2d7df7-0.run.webtask.io/linksave';

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
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

document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabInfo((pageInfo) => {
    var save = document.getElementById('save');

    document.getElementById('linkUrl').value = pageInfo.url;
    document.getElementById('linkTitle').value = pageInfo.title;

    save.addEventListener('click', savePage);
  });
});
