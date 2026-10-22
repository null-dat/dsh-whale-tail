window.__ModuleLoader__.load({
  id: "dsh-whale-tail",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;

    const PLUGIN_ID = 'dsh-whale-tail';
    // 0.2.x 的状态行是 div[data-chat-running]，内部图标位同时有 <span>（遮罩层）和 <svg>（静态兜底）。
    const HOST_SELECTOR = '[data-chat-running] span:has(> svg)';
    const HOST_ATTRIBUTE = 'data-dsh-tail-host';
    const STATE_ATTRIBUTE = 'data-dsh-tail-state';
    const SIZE = 18;

    // 四态取自用户提供的参考视频，线性求 alpha 后加粗 1px；颜色由 currentColor 提供。
    const STATES = __STATES_JSON__;

    const CSS = `
      [${HOST_ATTRIBUTE}] { position: relative !important; overflow: visible !important; contain: none !important; }
      [${HOST_ATTRIBUTE}] > svg, [${HOST_ATTRIBUTE}] > span { opacity: 0 !important; }
      [${HOST_ATTRIBUTE}]::after {
        content: ""; position: absolute; left: 50%; top: 50%;
        width: ${SIZE}px; height: ${SIZE}px;
        transform: translate(-50%, -50%);
        background: currentColor;
        -webkit-mask-image: var(--dsh-tail-mask); mask-image: var(--dsh-tail-mask);
        -webkit-mask-size: calc(var(--dsh-tail-n) * ${SIZE}px) ${SIZE}px;
        mask-size: calc(var(--dsh-tail-n) * ${SIZE}px) ${SIZE}px;
        -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
        animation: dsh-tail-play var(--dsh-tail-dur) steps(var(--dsh-tail-n)) infinite;
        pointer-events: none;
      }
      @keyframes dsh-tail-play {
        from { -webkit-mask-position: 0 0; mask-position: 0 0; }
        to   { -webkit-mask-position: calc(-1 * var(--dsh-tail-n) * ${SIZE}px) 0;
               mask-position: calc(-1 * var(--dsh-tail-n) * ${SIZE}px) 0; }
      }
      @media (prefers-reduced-motion: reduce) { [${HOST_ATTRIBUTE}]::after { animation: none !important; } }
    `;

    const objectUrls = new Map();
    let rotation = 0;

    function maskUrl(state) {
      if (!objectUrls.has(state.key)) {
        const binary = atob(state.b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
        objectUrls.set(state.key, URL.createObjectURL(new Blob([bytes], { type: 'image/png' })));
      }
      return objectUrls.get(state.key);
    }

    /** 每轮换一态；也可用 <html data-dsh-tail-state="v2"> 固定某一态。 */
    function pickState() {
      const forced = document.documentElement.getAttribute('data-dsh-tail-pick');
      const found = STATES.find((s) => s.key === forced);
      if (found) return found;
      const state = STATES[rotation % STATES.length];
      rotation += 1;
      return state;
    }

    function apply(ctx) {
      ctx.effect(() => {
        const style = document.createElement('style');
        style.dataset.plugin = PLUGIN_ID;
        style.textContent = CSS;
        document.head.appendChild(style);

        const attached = new WeakMap();

        function attach(host) {
          if (attached.has(host)) return;
          const state = pickState();
          attached.set(host, state.key);
          host.setAttribute(HOST_ATTRIBUTE, 'true');
          host.setAttribute(STATE_ATTRIBUTE, state.key);
          host.style.setProperty('--dsh-tail-mask', `url("${maskUrl(state)}")`);
          host.style.setProperty('--dsh-tail-n', String(state.frames));
          host.style.setProperty('--dsh-tail-dur', `${state.loopMs}ms`);
        }

        function scan() {
          for (const el of document.querySelectorAll(HOST_SELECTOR)) attach(el);
        }

        const observer = new MutationObserver(() => scan());
        observer.observe(document.documentElement, { childList: true, subtree: true });
        scan();

        return () => {
          observer.disconnect();
          style.remove();
          for (const url of objectUrls.values()) URL.revokeObjectURL(url);
          objectUrls.clear();
        };
      }, `${PLUGIN_ID}: whale tail beside running status`);
    }

    exports.apply = apply;
    exports.name = PLUGIN_ID;
    exports.states = STATES.map((s) => s.key);

    return module.exports;
  }
});
