chrome.browserAction.onClicked.addListener(function(activeTab){
	chrome.tabs.create({ url: "data/index.html" });
});