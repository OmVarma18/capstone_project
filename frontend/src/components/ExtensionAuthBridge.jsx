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

    // Check if we're running inside a browser with the TalkNote extension
    const syncToExtension = async () => {
      try {
        // Method 1: Use chrome.storage directly (works if extension has host_permissions for localhost)
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          const token = await getToken();
          chrome.storage.local.set({
            userId: user.id,
            userEmail: user.primaryEmailAddress?.emailAddress || '',
            sessionToken: token
          }, () => {
            console.log('[TalkNote] Auth synced to extension storage');
          });
          return;
        }

        // Method 2: Use postMessage for cross-context communication
        // The extension's background.js listens for external messages
        if (typeof chrome !== 'undefined' && chrome.runtime) {
          const token = await getToken();
          // Try to send to the extension via externally_connectable
          // This requires the extension ID, so we broadcast instead
          window.postMessage({
            type: 'TALKNOTE_AUTH_SYNC',
            userId: user.id,
            userEmail: user.primaryEmailAddress?.emailAddress || '',
            sessionToken: token
          }, '*');
        }
      } catch (err) {
        // Silently fail — user might not have extension installed
        console.debug('[TalkNote] Extension sync skipped:', err.message);
      }
    };

    syncToExtension();
  }, [isSignedIn, user, getToken]);

  return null; // This component renders nothing
};

export default ExtensionAuthBridge;
