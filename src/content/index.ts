(function () {
	const ns = globalThis.YTLayoutCustomizer!;

	// If already loaded, fire the layout and exit.
	if (globalThis.hasYTCustomizerLoaded) {
		ns.autoLoadConfigAndApply?.();
		return;
	}

	// Set the global initialization flag safely
	globalThis.hasYTCustomizerLoaded = true;

	chrome.runtime.onMessage.addListener((message) => {
		if (message?.action === 'OPEN_SETTINGS_MODAL') {
			ns.showOptionsDialog?.();
		}
	});

	ns.autoLoadConfigAndApply?.();
})();
