export function useNoise() {
  const size = 200;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 255;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 18;
  }
  ctx.putImageData(imageData, 0, 0);
  const dataUrl = canvas.toDataURL("image/png");
  let overlay = document.getElementById("noise-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "noise-overlay";
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.9;
    `;
    document.body.appendChild(overlay);
  }
  overlay.style.backgroundImage = `url(${dataUrl})`;
  overlay.style.backgroundRepeat = "repeat";
}
