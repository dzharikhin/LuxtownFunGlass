chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (sender.tab) {
        chrome.pageAction.show(sender.tab.id);
        sendResponse({result: "success"});
    }        
});