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
${ns.escapeHtml(ns.serializeBreakpoints(config.adaptiveBreakpoints))}</textarea
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
				<button id="btn-help" class="ytc-btn">? Help</button>
				<button id="btn-cancel" class="ytc-btn">Cancel</button>
				<button id="btn-save" class="ytc-btn ytc-btn-primary">Apply Changes</button>
			</div>
		</div>
	`;
}

function getHelpHtml(): string {
	return /* HTML */ `
		<h3 class="ytc-heading">
			<span class="ytc-heading-icon">?</span>
			<span>How to use Layout Customizer</span>
		</h3>

		<div class="ytc-help-content">
			<h4>Layout Modes</h4>
			<p><strong>Manual:</strong> Uses the same values no matter the width</p>
			<p>
				<strong>Adaptive:</strong> Allows you to set breakpoints that adjust the values
				depending on th width
			</p>
			<h4>Breakpoint format</h4>
			<pre class="ytc-help-code">
[
  {
    "maxWidth": 900,
    "videosPerRow": 4,
    "shortsPerRow": 5,
    "sidebarWidth": "260px"
  },
  {
    "maxWidth": "Infinity",
    "videosPerRow": 6,
    "shortsPerRow": 7,
    "sidebarWidth": "320px"
  }
]   
            </pre
			>

			<p>Use widths such as <code>280px</code>, <code>20rem</code>, or <code>25vw</code>.</p>
			<div class="ytc-footer">
				<button id="btn-back-to-settings" class="ytc-btn ytc-btn-primary">
					Back to settings
				</button>
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
	buildDialogHtml,
	getHelpHtml
});
