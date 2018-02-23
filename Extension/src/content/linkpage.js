(function (d) {
    const $ = d.querySelector.bind(d);

    function init() {
        $('#close').addEventListener("click", () => {
            window.parent.postMessage({ messageType: messageType.Close }, "*");
        });
        window.addEventListener("message", messageHandler);
        main();
    }

    function messageHandler(event) {
        switch (event.data.messageType) {
            case messageType.AuthOk:
                main();
                break;
            case messageType.AuthFail:
                // TODO: Add more error notification.
                main();
                break;
            case messageType.SaveOk:
                window.parent.postMessage({ messageType: messageType.Close }, "*");
                break;
            case messageType.SaveFail:
                main();
                break;
        }
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

    function isLoggedIn(token) {
        // The user is logged in if their token isn't expired
        return jwt_decode(token).exp > Date.now() / 1000;
    }

    function logout() {
        // Remove the idToken from storage
        localStorage.clear();
        main();
    }

    function renderForm() {
        $('#auth').classList.add('hidden');
        $('#linkInfo').classList.remove('hidden');
        $('#spinner').classList.add('hidden');
        getCurrentTabInfo((pageInfo) => {
            $('#linkUrl').value = pageInfo.url; //window.parent.location.href;
            $('#linkTitle').value = pageInfo.title; //window.parent.document.title;
        });

        $('#save').addEventListener('click', savePage);
        $('#logout').addEventListener('click', logout);
    }

    function renderAuth() {
        $('#auth').classList.remove('hidden');
        $('#linkInfo').classList.add('hidden');
        $('#spinner').classList.add('hidden');

        $('#login').addEventListener('click', () => {
            $('#auth').classList.add('hidden');
            $('#spinner').classList.remove('hidden');
            window.parent.postMessage({ messageType: messageType.Auth }, "*");
        });
    }

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
            , category = $('#linkCategory');

        page.link = {};
        page.link.longUrl = $('#linkUrl').value;
        page.title = $('#linkTitle').value;
        page.author = $('#linkAuthor').value;
        if (category.value != "None") {
            page.category = category.value;
        }

        window.parent.postMessage({
            messageType: messageType.Save,
            page: page
        }, "*");
    }

    init();
}(document));