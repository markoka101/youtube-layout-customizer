"use strict";
(function () {
    const ns = globalThis.YTLayoutCustomizer;
    function closeDialog(dialog) {
        if (dialog.parentNode) {
            dialog.remove();
        }
    }
    function buildDialogHtml(config, isWatchPage) {
        const pageFields = isWatchPage
            ? getWatchPageFieldsHtml(config)
            : getBrowsePageFieldsHtml(config);
        return getBaseFormHtml(config) + pageFields + getFooterHtml();
    }
    function getDialogControls(dialog) {
        return {
            enabledCheckbox: dialog.querySelector('#input-enabled'),
            adaptiveCheckbox: dialog.querySelector('#input-adaptive'),
            breakpointsInput: dialog.querySelector('#input-breakpoints'),
            sidebarInput: dialog.querySelector('#input-sidebar'),
            videosInput: dialog.querySelector('#input-videos'),
            shortsInput: dialog.querySelector('#input-shorts')
        };
    }
    function applyModeAndBreakpoints(nextConfig, controls) {
        nextConfig.mode = controls.adaptiveCheckbox?.checked ? 'adaptive' : 'manual';
        // If adaptive mode is OFF or there is no textarea, keep existing breakpoints
        if (nextConfig.mode !== 'adaptive' || !controls.breakpointsInput) {
            return null;
        }
        try {
            nextConfig.adaptiveBreakpoints = ns.parseBreakpoints(controls.breakpointsInput.value);
            return null;
        }
        catch (error) {
            return `Invalid breakpoint JSON: \n${error.message}`;
        }
    }
    function applyWatchPageConfig(nextConfig, controls) {
        if (!controls.sidebarInput) {
            return;
        }
        nextConfig.sidebarWidth = controls.sidebarInput.value || ns.DEFAULT_CONFIG.sidebarWidth;
    }
    function applyBrowsePageConfig(nextConfig, controls) {
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
    function buildNextConfig(baseConfig, controls, isWatchPage) {
        const nextConfig = { ...baseConfig };
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
        }
        else {
            applyBrowsePageConfig(nextConfig, controls);
        }
        return nextConfig;
    }
    function saveAndApplyConfig(nextConfig, dialog) {
        ns.saveConfig(nextConfig).then(() => {
            ns.applyLayout(nextConfig);
            closeDialog(dialog);
        });
    }
    function createSubmitHandler(config, controls, isWatchPage, dialog) {
        return () => {
            const nextConfig = buildNextConfig(config, controls, isWatchPage);
            if (!nextConfig) {
                return;
            }
            saveAndApplyConfig(nextConfig, dialog);
        };
    }
    function attachDialogHandlers(dialog, config, controls, isWatchPage) {
        const submit = createSubmitHandler(config, controls, isWatchPage, dialog);
        dialog
            .querySelectorAll('input, textarea')
            .forEach((input) => {
            ns.addInputEnterKeyHandler(input, submit);
        });
        dialog
            .querySelector('#btn-cancel')
            ?.addEventListener('click', () => closeDialog(dialog));
        dialog.querySelector('#btn-reset')?.addEventListener('click', () => {
            closeDialog(dialog);
            ns.resetSettings();
        });
        dialog.querySelector('#btn-save')?.addEventListener('click', submit);
    }
    function removeExistingDialog() {
        const existing = document.getElementById('yt-customizer-dialog');
        if (existing) {
            existing.remove();
        }
    }
    function createDialog(config, isWatchPage) {
        const dialog = document.createElement('div');
        dialog.id = 'yt-customizer-dialog';
        dialog.innerHTML = buildDialogHtml(config, isWatchPage);
        document.body.appendChild(dialog);
        return dialog;
    }
    function showOptionsDialog() {
        ns.loadConfig().then((config) => {
            const isWatchPage = globalThis.location.pathname.includes('/watch');
            removeExistingDialog();
            const dialog = createDialog(config, isWatchPage);
            const controls = getDialogControls(dialog);
            attachDialogHandlers(dialog, config, controls, isWatchPage);
        });
    }
    Object.assign(ns, { showOptionsDialog, closeDialog });
})();
