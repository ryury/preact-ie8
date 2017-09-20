export const inBrowser = typeof window !== 'undefined';
export const UA = inBrowser && window.navigator.userAgent.toLowerCase();
export const isIE8 = UA && UA.indexOf('msie 8.0') > 0;