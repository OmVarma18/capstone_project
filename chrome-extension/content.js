/**
 * TalkNote Chrome Extension – Content Script
 * 
 * Injected into Google Meet, Zoom, and MS Teams pages.
 * Detects whether a meeting is currently active and reports
 * the status back to the background service worker.
 */

(function () {
  'use strict';

  const PLATFORM = detectPlatform();
  let lastStatus = null;

  function detectPlatform() {
    const url = window.location.href;
    if (url.includes('meet.google.com')) return 'Google Meet';
    if (url.includes('zoom.us')) return 'Zoom';
    if (url.includes('teams.microsoft.com') || url.includes('teams.live.com')) return 'Microsoft Teams';
    return 'Unknown';
  }

  /**
   * Platform-specific meeting detection
   */
  function isInMeeting() {
    switch (PLATFORM) {
      case 'Google Meet':
        return detectGoogleMeet();
      case 'Zoom':
        return detectZoom();
      case 'Microsoft Teams':
        return detectTeams();
      default:
        return false;
    }
  }

  function detectGoogleMeet() {
    // Google Meet shows specific elements when you're in an active call
    // The end call button is a reliable indicator
    const endCallBtn = document.querySelector('[data-tooltip="Leave call"]') ||
                        document.querySelector('[aria-label="Leave call"]') ||
                        document.querySelector('button[data-is-muted]');
    
    // Also check for the meeting code in the URL (not just the landing page)
    const hasActiveMeeting = window.location.pathname.length > 4; // e.g., /abc-defg-hij
    
    return !!(endCallBtn || (hasActiveMeeting && document.querySelector('[data-self-name]')));
  }

  function detectZoom() {
    // Zoom web client shows a toolbar when in a meeting
    const meetingToolbar = document.querySelector('.meeting-app') ||
                           document.querySelector('#wc-container-left') ||
                           document.querySelector('.meeting-client');
    return !!meetingToolbar;
  }

  function detectTeams() {
    // Teams shows specific elements during an active call
    const callControls = document.querySelector('[data-tid="call-controls"]') ||
                          document.querySelector('.calling-controls-section') ||
                          document.querySelector('[data-cid="calling-unified-bar"]');
    return !!callControls;
  }

  /**
   * Periodic check and report to background
   */
  function checkAndReport() {
    const inMeeting = isInMeeting();

    // Only send messages when status changes to avoid spam
    if (inMeeting !== lastStatus) {
      lastStatus = inMeeting;

      chrome.runtime.sendMessage({
        type: inMeeting ? 'MEETING_DETECTED' : 'NO_MEETING',
        platform: PLATFORM,
        url: window.location.href
      }).catch(() => {
        // Extension context invalidated, ignore
      });
    }
  }

  /**
   * Handle messages from the popup
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_MEETING_STATUS') {
      sendResponse({
        inMeeting: isInMeeting(),
        platform: PLATFORM
      });
    }
    return true;
  });

  // Start periodic checking (every 3 seconds)
  checkAndReport();
  setInterval(checkAndReport, 3000);

  console.log(`[TalkNote] Content script loaded for ${PLATFORM}`);
})();
