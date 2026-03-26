/**
 * TalkNote Chrome Extension – Background Service Worker
 * 
 * Manages:
 * - Global recording state tracking
 * - Message routing between popup and content scripts
 * - Extension badge updates
 */

let isRecording = false;
let recordingStartTime = null;

// ============ Message Handler ============
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_STATE':
      const elapsed = isRecording && recordingStartTime
        ? Math.floor((Date.now() - recordingStartTime) / 1000)
        : 0;
      sendResponse({ isRecording, elapsed });
      break;

    case 'RECORDING_STARTED':
      isRecording = true;
      recordingStartTime = Date.now();
      chrome.action.setBadgeText({ text: 'REC' });
      chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
      sendResponse({ ok: true });
      break;

    case 'RECORDING_STOPPED':
      isRecording = false;
      recordingStartTime = null;
      chrome.action.setBadgeText({ text: '' });
      sendResponse({ ok: true });
      break;

    case 'MEETING_DETECTED':
      // Content script is telling us about a meeting
      chrome.action.setBadgeText({ text: '●' });
      chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
      sendResponse({ ok: true });
      break;

    case 'NO_MEETING':
      if (!isRecording) {
        chrome.action.setBadgeText({ text: '' });
      }
      sendResponse({ ok: true });
      break;

    default:
      sendResponse({ error: 'Unknown message type' });
  }

  return true; // Keep the message channel open for async responses
});

// ============ Extension Install Handler ============
chrome.runtime.onInstalled.addListener(() => {
  console.log('TalkNote Extension installed successfully!');
  chrome.action.setBadgeText({ text: '' });
});

// ============ Listen for web app auth messages ============
// When the user signs in on the web app, the web app can post a message
// to a redirect page that stores the auth in chrome.storage
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.type === 'TALKNOTE_AUTH') {
    chrome.storage.local.set({
      userId: message.userId,
      userEmail: message.userEmail,
      sessionToken: message.sessionToken
    }, () => {
      sendResponse({ ok: true });
    });
    return true;
  }
});
