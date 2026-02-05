// ---- Config (same complexity, different structure) ----
const FILTER_SCHEMA = {
    brightness: { label: "Brightness", min: 0, max: 200, unit: "%", default: 100, cssFn: "brightness" },
    contrast: { label: "Contrast", min: 0, max: 200, unit: "%", default: 100, cssFn: "contrast" },
    saturation: { label: "Saturation", min: 0, max: 200, unit: "%", default: 100, cssFn: "saturate" },
    hueRotation: { label: "Hue", min: 0, max: 360, unit: "deg", default: 0, cssFn: "hue-rotate" },
    blur: { label: "Blur", min: 0, max: 20, unit: "px", default: 0, cssFn: "blur" },
    grayscale: { label: "Grayscale", min: 0, max: 100, unit: "%", default: 0, cssFn: "grayscale" },
    sepia: { label: "Sepia", min: 0, max: 100, unit: "%", default: 0, cssFn: "sepia" },
    opacity: { label: "Opacity", min: 0, max: 100, unit: "%", default: 100, cssFn: "opacity" },
    invert: { label: "Invert", min: 0, max: 100, unit: "%", default: 0, cssFn: "invert" },
  };
  
  const PRESETS = {
    normal: { brightness: 100, contrast: 100, saturation: 100, hueRotation: 0, blur: 0, grayscale: 0, sepia: 0, opacity: 100, invert: 0 },
    vintage: { brightness: 105, contrast: 90, saturation: 80, hueRotation: 10, blur: 1, grayscale: 10, sepia: 40, opacity: 100, invert: 0 },
    oldSchool: { brightness: 95, contrast: 120, saturation: 70, hueRotation: 0, blur: 2, grayscale: 30, sepia: 60, opacity: 100, invert: 0 },
    blackAndWhite: { brightness: 100, contrast: 130, saturation: 0, hueRotation: 0, blur: 0, grayscale: 100, sepia: 0, opacity: 100, invert: 0 },
    warm: { brightness: 110, contrast: 105, saturation: 120, hueRotation: 350, blur: 0, grayscale: 0, sepia: 20, opacity: 100, invert: 0 },
    cool: { brightness: 100, contrast: 110, saturation: 90, hueRotation: 20, blur: 0, grayscale: 0, sepia: 0, opacity: 100, invert: 0 },
    faded: { brightness: 110, contrast: 80, saturation: 85, hueRotation: 0, blur: 1, grayscale: 5, sepia: 15, opacity: 100, invert: 0 },
    dramatic: { brightness: 90, contrast: 150, saturation: 120, hueRotation: 0, blur: 0, grayscale: 0, sepia: 0, opacity: 100, invert: 0 },
    negative: { brightness: 100, contrast: 100, saturation: 100, hueRotation: 0, blur: 0, grayscale: 0, sepia: 0, opacity: 100, invert: 100 },
  };
  
  // ---- DOM ----
  const el = {
    file: document.querySelector("#filePicker"),
    reset: document.querySelector("#btnReset"),
    download: document.querySelector("#btnDownload"),
    canvas: document.querySelector("#canvas"),
    empty: document.querySelector("#emptyState"),
    sliders: document.querySelector("#sliders"),
    presets: document.querySelector("#presetGrid"),
  };
  
  const ctx = el.canvas.getContext("2d");
  
  // ---- State ----
  const state = {
    img: null,
    values: createDefaultValues(),
  };
  
  function createDefaultValues() {
    const v = {};
    Object.keys(FILTER_SCHEMA).forEach((key) => (v[key] = FILTER_SCHEMA[key].default));
    return v;
  }
  
  // ---- UI Builders ----
  function buildSliders() {
    el.sliders.innerHTML = "";
  
    Object.entries(FILTER_SCHEMA).forEach(([key, meta]) => {
      const wrap = document.createElement("div");
      wrap.className = "slider";
  
      const head = document.createElement("div");
      head.className = "slider-head";
  
      const label = document.createElement("span");
      label.textContent = meta.label;
  
      const valueText = document.createElement("span");
      valueText.id = `val-${key}`;
      valueText.textContent = formatValue(key);
  
      head.appendChild(label);
      head.appendChild(valueText);
  
      const input = document.createElement("input");
      input.type = "range";
      input.min = meta.min;
      input.max = meta.max;
      input.value = state.values[key];
      input.dataset.filter = key;
  
      wrap.appendChild(head);
      wrap.appendChild(input);
      el.sliders.appendChild(wrap);
    });
  }
  
  function buildPresets() {
    el.presets.innerHTML = "";
  
    Object.keys(PRESETS).forEach((name) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn";
      btn.dataset.preset = name;
      btn.textContent = name;
      el.presets.appendChild(btn);
    });
  }
  
  // ---- Image + Rendering ----
  function formatValue(key) {
    const unit = FILTER_SCHEMA[key].unit;
    return `${state.values[key]}${unit}`;
  }
  
  function getFilterString() {
    // Build like: brightness(100%) contrast(120%) ...
    return Object.entries(FILTER_SCHEMA)
      .map(([key, meta]) => `${meta.cssFn}(${state.values[key]}${meta.unit})`)
      .join(" ");
  }
  
  function render() {
    if (!state.img) return;
  
    el.canvas.width = state.img.width;
    el.canvas.height = state.img.height;
  
    ctx.clearRect(0, 0, el.canvas.width, el.canvas.height);
    ctx.filter = getFilterString();
    ctx.drawImage(state.img, 0, 0);
  }
  
  function setLoadedUI(isLoaded) {
    el.canvas.style.display = isLoaded ? "block" : "none";
    el.empty.style.display = isLoaded ? "none" : "flex";
  }
  
  // ---- Events ----
  el.file.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const img = new Image();
    img.src = URL.createObjectURL(file);
  
    img.onload = () => {
      state.img = img;
      setLoadedUI(true);
      render();
    };
  });
  
  // slider change (event delegation)
  el.sliders.addEventListener("input", (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (!input.dataset.filter) return;
    if (!state.img) return;
  
    const key = input.dataset.filter;
    state.values[key] = Number(input.value);
  
    const valueEl = document.querySelector(`#val-${key}`);
    if (valueEl) valueEl.textContent = formatValue(key);
  
    render();
  });
  
  // preset click (event delegation)
  el.presets.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-preset]");
    if (!btn) return;
    if (!state.img) return;
  
    const presetName = btn.dataset.preset;
    const preset = PRESETS[presetName];
    if (!preset) return;
  
    Object.keys(FILTER_SCHEMA).forEach((key) => {
      state.values[key] = preset[key];
    });
  
    // update slider UI values
    buildSliders();
    render();
  });
  
  el.reset.addEventListener("click", () => {
    if (!state.img) return;
  
    state.values = createDefaultValues();
    buildSliders();
    render();
  });
  
  el.download.addEventListener("click", () => {
    if (!state.img) return;
  
    const a = document.createElement("a");
    a.download = "edited-image.png";
    a.href = el.canvas.toDataURL("image/png");
    a.click();
  });
  
  // ---- Init ----
  buildSliders();
  buildPresets();
  setLoadedUI(false);
  