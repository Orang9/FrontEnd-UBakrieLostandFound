export async function createScanner(elementId) {
  if (!elementId) {
    throw new TypeError('Scanner requires a target element ID.');
  }
  const { Html5Qrcode } = await import('html5-qrcode');
  return new Html5Qrcode(elementId);
}
