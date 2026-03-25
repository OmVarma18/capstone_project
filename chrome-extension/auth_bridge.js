/**
 * TalkNote Chrome Extension – Web App Auth Bridge Content Script
 * 
 * Injected into the TalkNote web app (localhost:5173).
 * Listens for postMessage from ExtensionAuthBridge.jsx and
 * forwards the auth credentials to chrome.storage.local.
 */

(function () {
  'use strict';

  window.addEventListener('message', (event) => {
    // Only accept messages from the same page
    if (event.source !== window) return;

    if (event.data && event.data.type === 'TALKNOTE_AUTH_SYNC') {
      const { userId, userEmail, sessionToken } = event.data;

      if (userId) {
        chrome.storage.local.set({
          userId,
          userEmail: userEmail || '',
          sessionToken: sessionToken || ''
        }, () => {
          console.log('[TalkNote Extension] Auth synced successfully for', userEmail);
          // Post confirmation back to the page
          window.postMessage({ type: 'TALKNOTE_AUTH_SYNCED', ok: true }, '*');
        });
      }
    }
  });

  console.log('[TalkNote Extension] Auth bridge content script loaded');
})();
