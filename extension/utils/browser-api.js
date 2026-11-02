// check the browser
// if firefox or safari then the object is browser
// if from chromium family then the object is chrome
export const api = globalThis.browser ?? globalThis.chrome;
