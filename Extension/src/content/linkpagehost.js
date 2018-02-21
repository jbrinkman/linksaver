(function () {
    function injectIframeContent() {
        var iframe = document.createElement("iframe");
        iframe.src = chrome.extension.getURL("src/content/linkpage.html");
        iframe.id = "linkSaver";
        iframe.frameBorder = "0";
        document.body.appendChild(iframe);

        window.addEventListener("message", (event) => {
            switch (event.data) {
                case "LS_CLOSE":
                    removeIframe();
                    break;
                case "LS_AUTH":
                    chrome.runtime.sendMessage(
                        { type: "authenticate" },
                        function (response) {
                            if (response.auth == 'OK') {
                                //setTimeout(main, 250);
                                console.log("LS_AUTH_OK");
                            }
                        }
                    );
                    break;
            }
        });
    }

    function removeIframe() {
        var iframe = document.getElementById("linkSaver");
        if (iframe) {
            iframe.parentNode.removeChild(iframe);
        }
        window.linkSaverExists = false;
    }

    if (window.linkSaverExists === true) {
        removeIframe();
        return true;  // Will ultimately be passed back to executeScript
    }
    window.linkSaverExists = true;

    injectIframeContent();
})();

