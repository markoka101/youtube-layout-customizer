const ns = globalThis.YTLayoutCustomizer;

function getBaseFormHtml(config: LayoutConfig): string {
	return /* HTML */ `
		<h3 class="ytc-heading">
			<span class="ytc-heading-icon">📺</span>
			<span>YT Layout Controls</span>
		</h3>

		<div class="ytc-field">
			<label class="ytc-inline-label">
				<input
					type="checkbox"
					id="input-enabled"
					${config.enabled === true ? 'checked' : ''}
				/>
				<span> Enable layout customization </span>
			</label>
		</div>

		<div class="ytc-field">
			<label class="ytc-inline-label">
				<input
					type="checkbox"
					id="input-adaptive"
					${config.mode === 'adaptive' ? 'checked' : ''}
				/>
				<span>Adaptive layout (Automatically adjusts based on window size)</span>
			</label>
		</div>

		<div class="ytc-field">
			<label class="ytc-label">Adaptive Breakpoints (JSON):</label>
			<textarea id="input-breakpoints" rows="8" class="ytc-textarea">
                    ${ns.escapeHtml(ns.serializeBreakpoints(config.adaptiveBreakpoints))}
                </textarea
			>
		</div>
	`;
}

function getWatchPageFieldsHtml(config: LayoutConfig): string {
	return /* HTML */ `
		<div class="ytc-field">
			<label class="ytc-label"> Sidebar Width: </label>
			<input
				type="text"
				id="input-sidebar"
				value="${config.sidebarWidth}"
				class="ytc-input"
			/>
		</div>
	`;
}

function getBrowsePageFieldsHtml(config: LayoutConfig): string {
	return /* HTML */ `
		<div class="ytc-field">
			<label class="ytc-label">Standard Videos Per Row (manual mode):</label>
			<input
				type="number"
				min="1"
				max="12"
				id="input-videos"
				value="${config.videosPerRow}"
				class="ytc-input"
			/>
		</div>

		<div class="ytc-field">
			<label class="ytc-label">Shorts Per Row (manual mode):</label>
			<input
				type="number"
				min="1"
				max="12"
				id="input-shorts"
				value="${config.shortsPerRow}"
				class="ytc-input"
			/>
		</div>
	`;
}

function getFooterHtml(): string {
	return /* HTML */ `
		<div class="ytc-footer">
			<button id="btn-reset" class="ytc-btn ytc-btn-reset">Reset</button>
			<div class="ytc-btn-group">
				<button id="btn-cancel" class="ytc-btn">Cancel</button>
				<button id="btn-save" class="ytc-btn ytc-btn-primary">Apply Changes</button>
			</div>
		</div>
	`;
}

function buildDialogHtml(config: LayoutConfig, isWatchPage: boolean): string {
	const pageFields = isWatchPage
		? getWatchPageFieldsHtml(config)
		: getBrowsePageFieldsHtml(config);

	return getBaseFormHtml(config) + pageFields + getFooterHtml();
}

Object.assign(globalThis.YTLayoutCustomizer, {
	buildDialogHtml
});
