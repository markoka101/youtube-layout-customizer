(function () {
	const ns = globalThis.YTLayoutCustomizer;

	type DialogControls = {
		enabledCheckbox: HTMLInputElement | null;
		adaptiveCheckbox: HTMLInputElement | null;
		breakpointsInput: HTMLTextAreaElement | null;
		sidebarInput: HTMLInputElement | null;
		videosInput: HTMLInputElement | null;
		shortsInput: HTMLInputElement | null;
	};

	function closeDialog(dialog: HTMLElement): void {
		if (dialog.parentNode) {
			dialog.remove();
		}
	}

	function buildDialogHtml(config: LayoutConfig, isWatchPage: boolean): string {
		const pageFields = isWatchPage
			? getWatchPageFieldsHtml(config)
			: getBrowsePageFieldsHtml(config);

		return getBaseFormHtml(config) + pageFields + getFooterHtml();
	}

	function getDialogControls(dialog: HTMLElement): DialogControls {
		return {
			enabledCheckbox: dialog.querySelector<HTMLInputElement>('#input-enabled'),
			adaptiveCheckbox: dialog.querySelector<HTMLInputElement>('#input-adaptive'),
			breakpointsInput: dialog.querySelector<HTMLTextAreaElement>('#input-breakpoints'),
			sidebarInput: dialog.querySelector<HTMLInputElement>('#input-sidebar'),
			videosInput: dialog.querySelector<HTMLInputElement>('#input-videos'),
			shortsInput: dialog.querySelector<HTMLInputElement>('#input-shorts')
		};
	}

	function applyModeAndBreakpoints(
		nextConfig: LayoutConfig,
		controls: DialogControls
	): string | null {
		nextConfig.mode = controls.adaptiveCheckbox?.checked ? 'adaptive' : 'manual';

		// If adaptive mode is OFF or there is no textarea, keep existing breakpoints
		if (nextConfig.mode !== 'adaptive' || !controls.breakpointsInput) {
			return null;
		}

		try {
			nextConfig.adaptiveBreakpoints = ns.parseBreakpoints(controls.breakpointsInput.value);
			return null;
		} catch (error) {
			return `Invalid breakpoint JSON: \n${(error as Error).message}`;
		}
	}

	function applyWatchPageConfig(nextConfig: LayoutConfig, controls: DialogControls): void {
		if (!controls.sidebarInput) {
			return;
		}

		nextConfig.sidebarWidth = controls.sidebarInput.value || ns.DEFAULT_CONFIG.sidebarWidth;
	}

	function applyBrowsePageConfig(nextConfig: LayoutConfig, controls: DialogControls): void {
		if (controls.videosInput) {
			const vVal = Number.parseInt(controls.videosInput.value, 10);
			if (!Number.isNaN(vVal) && vVal > 0) {
				nextConfig.videosPerRow = vVal;
			}
		}

		if (controls.shortsInput) {
			const sVal = Number.parseInt(controls.shortsInput.value, 10);
			if (!Number.isNaN(sVal) && sVal > 0) {
				nextConfig.shortsPerRow = sVal;
			}
		}
	}

	function buildNextConfig(
		baseConfig: LayoutConfig,
		controls: DialogControls,
		isWatchPage: boolean
	): LayoutConfig | null {
		const nextConfig: LayoutConfig = { ...baseConfig };

		if (controls.enabledCheckbox) {
			nextConfig.enabled = controls.enabledCheckbox.checked;
		}
		const breakpointError = applyModeAndBreakpoints(nextConfig, controls);
		if (breakpointError) {
			alert(breakpointError);
			return null;
		}

		if (isWatchPage) {
			applyWatchPageConfig(nextConfig, controls);
		} else {
			applyBrowsePageConfig(nextConfig, controls);
		}

		return nextConfig;
	}

	function saveAndApplyConfig(nextConfig: LayoutConfig, dialog: HTMLElement): void {
		ns.saveConfig(nextConfig).then(() => {
			ns.applyLayout(nextConfig);
			closeDialog(dialog);
		});
	}

	function createSubmitHandler(
		config: LayoutConfig,
		controls: DialogControls,
		isWatchPage: boolean,
		dialog: HTMLElement
	): () => void {
		return () => {
			const nextConfig = buildNextConfig(config, controls, isWatchPage);
			if (!nextConfig) {
				return;
			}

			saveAndApplyConfig(nextConfig, dialog);
		};
	}

	function attachDialogHandlers(
		dialog: HTMLElement,
		config: LayoutConfig,
		controls: DialogControls,
		isWatchPage: boolean
	): void {
		const submit = createSubmitHandler(config, controls, isWatchPage, dialog);

		dialog.querySelector('#btn-help')?.addEventListener('click', () => {
			const draftConfig = snapshotConfig(config, controls, isWatchPage);
			dialog.innerHTML = ns.getHelpHtml();

			dialog.querySelector('#btn-back-to-settings')?.addEventListener('click', () => {
				dialog.innerHTML = ns.buildDialogHtml(draftConfig, isWatchPage);
				const nextControls = getDialogControls(dialog);
				attachDialogHandlers(dialog, draftConfig, nextControls, isWatchPage);
			});
		});
		dialog
			.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea')
			.forEach((input) => {
				ns.addInputEnterKeyHandler(input, submit);
			});

		dialog
			.querySelector<HTMLButtonElement>('#btn-cancel')
			?.addEventListener('click', () => closeDialog(dialog));

		dialog.querySelector<HTMLButtonElement>('#btn-reset')?.addEventListener('click', () => {
			closeDialog(dialog);
			ns.resetSettings();
		});

		dialog.querySelector<HTMLButtonElement>('#btn-save')?.addEventListener('click', submit);
	}

	function removeExistingDialog(): void {
		const existing = document.getElementById('yt-customizer-dialog');
		if (existing) {
			existing.remove();
		}
	}

	function createDialog(config: LayoutConfig, isWatchPage: boolean): HTMLElement {
		const dialog = document.createElement('div');
		dialog.id = 'yt-customizer-dialog';
		dialog.innerHTML = buildDialogHtml(config, isWatchPage);
		document.body.appendChild(dialog);
		return dialog;
	}

	function showOptionsDialog(): void {
		ns.loadConfig().then((config: LayoutConfig) => {
			const isWatchPage = globalThis.location.pathname.includes('/watch');

			removeExistingDialog();

			const dialog = createDialog(config, isWatchPage);
			const controls = getDialogControls(dialog);

			attachDialogHandlers(dialog, config, controls, isWatchPage);
		});
	}

	function snapshotConfig(
		config: LayoutConfig,
		controls: DialogControls,
		isWatchPage: boolean
	): LayoutConfig {
		const draft = buildNextConfig(config, controls, isWatchPage);

		return draft ?? config;
	}

	Object.assign(ns, { showOptionsDialog, closeDialog });
})();
