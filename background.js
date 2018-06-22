function sendUpdatedMessage(tabId, changeInfo, tab) {
    if (tab.url != undefined && changeInfo.status == 'complete' && tab.url.match(/(facebook|twitter)\.com/i) ) {        
        chrome.tabs.sendMessage(tabId, 'load-completed');
    }
 }

chrome.tabs.onUpdated.addListener(sendUpdatedMessage); 
 
