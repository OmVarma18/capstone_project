/**
 * ExtensionAuthBridge – Invisible component that syncs Clerk auth to the Chrome Extension
 * 
 * When the user signs into the web app (especially when redirected from the extension),
 * this component detects the Clerk session and writes the userId + email into
 * chrome.storage.local so the extension popup can read it.
 * 
 * This only runs when `chrome.runtime` is available (i.e., the extension is installed).
 */
import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';

const ExtensionAuthBridge = () => {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (!isSignedIn || !user) return;

    // Sync auth to the Chrome extension via postMessage.
    // The extension's auth_bridge.js content script (injected into localhost:5173)
    // listens for this message and writes to chrome.storage.local.
    const syncToExtension = async () => {
      try {
        const token = await getToken();
        window.postMessage({
          type: 'TALKNOTE_AUTH_SYNC',
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress || '',
          sessionToken: token
        }, '*');
        console.log('[TalkNote] Auth sync message posted for extension');
      } catch (err) {
        console.debug('[TalkNote] Extension sync skipped:', err.message);
      }
    };

    // Sync immediately and also after a short delay (in case content script loads late)
    syncToExtension();
    const retryTimeout = setTimeout(syncToExtension, 2000);
    return () => clearTimeout(retryTimeout);
  }, [isSignedIn, user, getToken]);

  return null; // This component renders nothing
};

export default ExtensionAuthBridge;
