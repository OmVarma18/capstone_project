/**
 * TalkNote Chrome Extension – Popup Script
 * 
 * Handles:
 * - Clerk authentication via redirect flow
 * - Recording controls (start/stop via tabCapture)
 * - Meeting detection status display
 * - Audio upload to local_server.js
 */

const API_URL = 'https://capstone-project-delta-nine.vercel.app/api';
const WEB_APP_URL = 'https://capstone-project-delta-nine.vercel.app';

// ============ DOM References ============
const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');
const btnSignIn = document.getElementById('btn-sign-in');
const btnSignOut = document.getElementById('btn-sign-out');
const userEmailEl = document.getElementById('user-email');

const meetingBanner = document.getElementById('meeting-banner');
const meetingStatusText = document.getElementById('meeting-status-text');

const stateIdle = document.getElementById('state-idle');
const stateRecording = document.getElementById('state-recording');
const stateUploading = document.getElementById('state-uploading');
const stateDone = document.getElementById('state-done');
const stateError = document.getElementById('state-error');

const btnStartRecord = document.getElementById('btn-start-record');
const btnStopRecord = document.getElementById('btn-stop-record');
const recordingTimer = document.getElementById('recording-timer');
const btnOpenDashboard = document.getElementById('btn-open-dashboard');
const btnRetry = document.getElementById('btn-retry');
const errorMessage = document.getElementById('error-message');

const linkDashboard = document.getElementById('link-dashboard');
const linkHistory = document.getElementById('link-history');
const linkTasks = document.getElementById('link-tasks');

// ============ State ============
let timerInterval = null;
let recordingSeconds = 0;

// ============ Init ============
document.addEventListener('DOMContentLoaded', async () => {
  // Set footer links
  linkDashboard.href = `${WEB_APP_URL}/`;
  linkHistory.href = `${WEB_APP_URL}/Meetings`;
  linkTasks.href = `${WEB_APP_URL}/Tasks`;

  // Check auth state
  const auth = await getAuth();
  if (auth && auth.userId) {
    showAppView(auth);
    checkMeetingStatus();
    checkRecordingState();
  } else {
    showAuthView();
  }
});

// ============ Auth ============

async function getAuth() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['userId', 'userEmail', 'sessionToken'], (data) => {
      if (data.userId) {
        resolve(data);
      } else {
        resolve(null);
      }
    });
  });
}

btnSignIn.addEventListener('click', () => {
  // Open the web app sign-in page. After signing in, user needs to 
  // come back and click "I've signed in" or we detect via storage change.
  chrome.tabs.create({ url: `${WEB_APP_URL}/sign-in?from=extension` });
  
  // Show a waiting state
  btnSignIn.textContent = 'Waiting for sign in...';
  btnSignIn.disabled = true;

  // Poll for auth cookie/token being set
  const pollAuth = setInterval(async () => {
    const auth = await getAuth();
    if (auth && auth.userId) {
      clearInterval(pollAuth);
      showAppView(auth);
      checkMeetingStatus();
    }
  }, 2000);

  // Stop polling after 5 minutes
  setTimeout(() => {
    clearInterval(pollAuth);
    btnSignIn.textContent = 'Sign in to TalkNote';
    btnSignIn.disabled = false;
  }, 300000);
});

btnSignOut.addEventListener('click', () => {
  chrome.storage.local.remove(['userId', 'userEmail', 'sessionToken'], () => {
    showAuthView();
  });
});

function showAuthView() {
  authView.classList.remove('hidden');
  appView.classList.add('hidden');
}

function showAppView(auth) {
  authView.classList.add('hidden');
  appView.classList.remove('hidden');
  userEmailEl.textContent = auth.userEmail || '';
}

// ============ Meeting Detection ============

function checkMeetingStatus() {
  // Query the active tab to see if content script has detected a meeting
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;

    const tab = tabs[0];
    const url = tab.url || '';

    // Check URL-based detection
    if (url.includes('meet.google.com') && url.includes('/')) {
      setMeetingDetected('Google Meet');
      return;
    }
    if (url.includes('zoom.us/wc/') || url.includes('zoom.us/j/')) {
      setMeetingDetected('Zoom');
      return;
    }
    if (url.includes('teams.microsoft.com') || url.includes('teams.live.com')) {
      setMeetingDetected('Microsoft Teams');
      return;
    }

    // Try to get status from content script
    chrome.tabs.sendMessage(tab.id, { type: 'GET_MEETING_STATUS' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        setNoMeeting();
        return;
      }
      if (response.inMeeting) {
        setMeetingDetected(response.platform);
      } else {
        setNoMeeting();
      }
    });
  });
}

function setMeetingDetected(platform) {
  meetingBanner.className = 'meeting-banner detected';
  meetingStatusText.textContent = `Meeting detected · ${platform}`;
}

function setNoMeeting() {
  meetingBanner.className = 'meeting-banner no-meeting';
  meetingStatusText.textContent = 'No meeting detected · Record any tab audio';
}

// ============ Recording ============

async function checkRecordingState() {
  // Check chrome.storage for recording state (survives popup close/reopen)
  chrome.storage.local.get(['isRecording', 'recordingStartTime'], (data) => {
    if (data.isRecording && data.recordingStartTime) {
      recordingSeconds = Math.floor((Date.now() - data.recordingStartTime) / 1000);
      showState('recording');
      startTimer();
    }
  });
}

btnStartRecord.addEventListener('click', async () => {
  const auth = await getAuth();
  if (!auth || !auth.userId) {
    showAuthView();
    return;
  }

  // Request tabCapture from the popup (requires user gesture)
  // chrome.tabCapture.capture() is callback-based, NOT promise-based
  chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
    if (chrome.runtime.lastError) {
      console.error('tabCapture error:', chrome.runtime.lastError);
      showError(`Capture failed: ${chrome.runtime.lastError.message}`);
      return;
    }

    if (!stream) {
      showError('Could not capture tab audio. Make sure a tab is active.');
      return;
    }

    startRecordingWithStream(stream, auth);
  });
});

let mediaRecorder = null;
let audioChunks = [];
let audioContext = null;

function startRecordingWithStream(stream, auth) {
  audioChunks = [];
  
  // ====== BUG #1 FIX: Pipe captured audio back to speakers ======
  // tabCapture.capture() steals the audio from the tab, making it silent.
  // We create an AudioContext that routes the captured stream back into
  // the user's speakers so they can still hear the meeting.
  try {
    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(audioContext.destination);
  } catch (e) {
    console.warn('Could not create audio playback:', e);
  }

  mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus'
  });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = async () => {
    // Stop all tracks and close audio context
    stream.getTracks().forEach(track => track.stop());
    if (audioContext) {
      audioContext.close().catch(() => {});
      audioContext = null;
    }
    
    // Combine chunks into a single blob
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    audioChunks = [];
    
    showState('uploading');
    stopTimer();

    // Clear recording state from storage
    chrome.storage.local.remove(['isRecording', 'recordingStartTime']);

    try {
      await uploadAudio(audioBlob, auth);
      showState('done');
    } catch (err) {
      console.error('Upload error:', err);
      showError(`Upload failed: ${err.message}`);
    }
  };

  mediaRecorder.start(1000); // Collect data every second
  recordingSeconds = 0;
  showState('recording');
  startTimer();

  // Save recording state so we can detect zombie sessions
  chrome.storage.local.set({
    isRecording: true,
    recordingStartTime: Date.now()
  });

  // Notify background about the recording state
  chrome.runtime.sendMessage({ type: 'RECORDING_STARTED' });
}

btnStopRecord.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    chrome.runtime.sendMessage({ type: 'RECORDING_STOPPED' });
  } else {
    // ====== BUG #3 FIX: Clean up zombie recording state ======
    // If the popup was reopened but mediaRecorder is gone (popup context died),
    // just reset everything so the user can start fresh.
    chrome.storage.local.remove(['isRecording', 'recordingStartTime']);
    chrome.runtime.sendMessage({ type: 'RECORDING_STOPPED' });
    showState('idle');
    stopTimer();
  }
});

// ============ Upload ============

async function uploadAudio(blob, auth) {
  // Convert blob to base64
  const base64 = await blobToBase64(blob);

  // Get language preference from storage
  const langData = await new Promise(resolve => {
    chrome.storage.local.get(['transcriptionLanguage'], resolve);
  });
  const language = langData.transcriptionLanguage || 'auto';

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': auth.userId
    },
    body: JSON.stringify({
      filename: `meeting_recording_${Date.now()}.webm`,
      fileData: base64,
      userId: auth.userId,
      language: language
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Upload failed');
  }

  return response.json();
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}

// ============ Timer ============

function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => {
    recordingSeconds++;
    const min = Math.floor(recordingSeconds / 60);
    const sec = recordingSeconds % 60;
    recordingTimer.textContent = `${min}:${sec < 10 ? '0' + sec : sec}`;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// ============ UI State Management ============

function showState(state) {
  stateIdle.classList.add('hidden');
  stateRecording.classList.add('hidden');
  stateUploading.classList.add('hidden');
  stateDone.classList.add('hidden');
  stateError.classList.add('hidden');

  switch (state) {
    case 'idle': stateIdle.classList.remove('hidden'); break;
    case 'recording': stateRecording.classList.remove('hidden'); break;
    case 'uploading': stateUploading.classList.remove('hidden'); break;
    case 'done': stateDone.classList.remove('hidden'); break;
    case 'error': stateError.classList.remove('hidden'); break;
  }
}

function showError(msg) {
  errorMessage.textContent = msg;
  showState('error');
}

// ============ Footer Buttons ============

btnOpenDashboard.addEventListener('click', () => {
  chrome.tabs.create({ url: `${WEB_APP_URL}/Meetings` });
});

btnRetry.addEventListener('click', () => {
  showState('idle');
});
