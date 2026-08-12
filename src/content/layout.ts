(function () {
	const ns = globalThis.YTLayoutCustomizer!;

	// track state of event dispatch
	let isDispatchingResize = false;

	// Apply layout based on user's config
	function getEffectiveConfig(config: LayoutConfig): LayoutConfig {
		if (config.mode !== 'adaptive') return config;

		const width = window.innerWidth || document.documentElement.clientWidth || 1920;

		const bp =
			config.adaptiveBreakpoints.find((b) => width <= b.maxWidth) ??
			config.adaptiveBreakpoints.at(-1)!;

		return {
			...config,
			videosPerRow: bp.videosPerRow,
			shortsPerRow: bp.shortsPerRow,
			sidebarWidth: bp.sidebarWidth
		};
	}

	// Inject the custom layout the user has decided on
	function applyLayout(config: LayoutConfig): void {
		if (!config.enabled) {
			const styleTag = document.getElementById('yt-layout-customizer-styles');
			if (styleTag) styleTag.remove();
			return;
		}
		const effective = getEffectiveConfig(config);

		let styleTag = document.getElementById(
			'yt-layout-customizer-styles'
		) as HTMLStyleElement | null;

		if (!styleTag) {
			styleTag = document.createElement('style');
			styleTag.id = 'yt-layout-customizer-styles';
			document.head.appendChild(styleTag);
		}

		styleTag.textContent = /* css */ `   
        ytd-rich-grid-renderer {
        --ytd-rich-grid-items-per-row: ${effective.videosPerRow} !important;
      }

    
      ytd-rich-shelf-renderer[is-shorts],
      ytd-rich-shelf-renderer[is-shorts] ytd-rich-grid-row,
        ytd-rich-shelf-renderer[is-shorts] #contents,
      ytd-rich-shelf-renderer[is-shorts] #items {
        --ytd-rich-shelf-items-per-row: ${effective.shortsPerRow} !important;
        --ytd-rich-grid-items-per-row: ${effective.shortsPerRow} !important;
        --ytd-rich-grid-posts-per-row: ${effective.shortsPerRow} !important;
        display: flex !important;
        flex-wrap: wrap !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }

      ytd-rich-shelf-renderer[is-shorts] ytd-rich-item-renderer {
        width: calc(
          100% / ${effective.shortsPerRow} -
          (((${effective.shortsPerRow} - 1) * var(--ytd-rich-grid-item-margin, 16px)) / ${effective.shortsPerRow})
        ) !important;
        max-width: calc(100% / ${effective.shortsPerRow}) !important;
        min-width: 120px !important;
        margin-right: var(--ytd-rich-grid-item-margin, 16px) !important;
        margin-bottom: var(--ytd-rich-grid-item-margin, 16px) !important;
        box-sizing: border-box !important;
      }

      ytd-rich-shelf-renderer[is-shorts] ytd-rich-item-renderer:nth-child(${effective.shortsPerRow}n) {
        margin-right: 0 !important;
      }


      #columns.ytd-watch-flexy,
      #primary.ytd-watch-flexy,
      #secondary.ytd-watch-flexy,
      ytd-watch-flexy,
      ytd-watch-flexy #columns,
      ytd-watch-flexy #primary,
      ytd-watch-flexy #secondary {
        min-width: 0 !important;
        box-sizing: border-box !important;
      }

      #secondary.ytd-watch-flexy,
      ytd-watch-flexy #secondary {
        width: ${effective.sidebarWidth} !important;
        min-width: ${effective.sidebarWidth} !important;
        max-width: ${effective.sidebarWidth} !important;
      }

      #secondary.ytd-watch-flexy ytd-compact-video-renderer,
      #secondary.ytd-watch-flexy ytd-item-section-renderer {
        width: 100% !important;
        max-width: 100% !important;
      }

      #primary.ytd-watch-flexy,
      ytd-watch-flexy #primary {
        flex-grow: 1 !important;
        max-width: none !important;
        width: auto !important;
      }

      ytd-watch-flexy {
        max-width: 100% !important;
        width: 100% !important;
        box-sizing: border-box !important;
        padding-inline-end: calc(12px + (100vw - 100%)) !important;
      }

      ytd-watch-flexy #player,
      ytd-watch-flexy #player-container,
      ytd-watch-flexy #ytd-player,
      ytd-watch-flexy .html5-video-player {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }


      @media (max-width: 1000px) {
        #columns.ytd-watch-flexy,
        ytd-watch-flexy #columns,
        #primary.ytd-watch-flexy,
        ytd-watch-flexy #primary {
          width: 100% !important;
          max-width: 100% !important;
        }
      }
    `;

		// signal that resize is already running to prevent calling function during
		isDispatchingResize = true;
		globalThis.dispatchEvent(new Event('resize'));
		isDispatchingResize = false;
	}

	async function autoLoadConfigAndApply(): Promise<void> {
		const config = await ns.loadConfig();
		applyLayout(config);

		if (!globalThis.__ytLayoutCustomizerHasResizeHandler) {
			globalThis.__ytLayoutCustomizerHasResizeHandler = true;
			globalThis.addEventListener('resize', () => {
				// return if already running
				if (isDispatchingResize) return;

				const current = ns.getCurrentConfig();
				if (!current) return;
				applyLayout(current);
			});
		}
	}

	Object.assign(ns, {
		getEffectiveConfig,
		applyLayout,
		autoLoadConfigAndApply
	});
})();
