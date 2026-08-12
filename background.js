async function openSettingsModal(tabId) {
	try {
		// Ping the tab to see if it responds
		await chrome.tabs.sendMessage(tabId, { action: 'OPEN_SETTINGS_MODAL' });
	} catch (err) {
		console.warn('Content script not ready, forcing single injection hook:', err);

		try {
			// Inject only once into the target tab
			await chrome.scripting.executeScript({
				target: { tabId: tabId },
				files: [
					'dist/content/config.js',
					'dist/content/layout.js',
					'dist/content/dialog-templates.js',
					'dist/content/dialog.js',
					'dist/content/index.js'
				]
			});

			// 100ms pause to let DOM variables bind safely
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Send the message again
			await chrome.tabs.sendMessage(tabId, { action: 'OPEN_SETTINGS_MODAL' });
		} catch (injectionErr) {
			console.error('Critical: Injection recovery failed:', injectionErr);
		}
	}
}

//  Open the modal when user clicks on icon while on youtube
chrome.action.onClicked.addListener((tab) => {
	if (!tab.id || !tab.url?.includes('youtube.com')) return;
	openSettingsModal(tab.id);
});

chrome.runtime.onInstalled.addListener(() => {
	console.log('Extension installed successfully.');
});
