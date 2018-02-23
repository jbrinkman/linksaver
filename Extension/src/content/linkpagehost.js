(function (d) {
    const $ = d.querySelector.bind(d);

    function injectIframeContent() {
        var iframe = document.createElement('iframe');
        iframe.src = chrome.extension.getURL('src/content/linkpage.html');
        iframe.id = 'linkSaver';
        iframe.frameBorder = '0';
        document.body.appendChild(iframe);

        window.addEventListener('message', messageHandler);
    }

    function removeIframe() {
        var iframe = document.getElementById('linkSaver');
        if (iframe) {
            window.removeEventListener('message', messageHandler);
            iframe.parentNode.removeChild(iframe);
        }
        window.linkSaverExists = false;
    }

    function messageHandler(event) {
        var iframe = $('#linkSaver');
        switch (event.data.messageType) {
            case messageType.Close:
                removeIframe();
                break;
            case messageType.Auth:
                chrome.runtime.sendMessage(
                    { type: messageType.Auth },
                    response => {
                        if (!response) {
                            console.log(runtime.lastError);
                        }
                        if (response.auth == messageType.AuthOk) {
                            iframe.contentWindow.postMessage({ 'messageType': messageType.AuthOk }, '*');
                        } else {
                            iframe.contentWindow.postMessage({ 'messageType': messageType.AuthFail }, '*');
                        }
                    }
                );
                break;
            case messageType.Save:
                chrome.runtime.sendMessage(
                    { type: messageType.Save, page: event.data.page },
                    response => {
                        if (!response) {
                            console.log(runtime.lastError);
                        }
                        if (response.saved === messageType.SaveOk) {
                            iframe.contentWindow.postMessage({ 'messageType': messageType.SaveOk }, '*');
                        } else {
                            iframe.contentWindow.postMessage({ 'messageType': messageType.SaveFail }, '*');
                        }
                    }
                );
                break;
        }
    }

    if (window.linkSaverExists === true) {
        removeIframe();
        return true;  // Will ultimately be passed back to executeScript
    }
    window.linkSaverExists = true;

    injectIframeContent();
}(document));

