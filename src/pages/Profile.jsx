// import React from 'react'
// import Navbar from '../components/Navbar'

// const Profile = () => {
//   return (
//     <div>
//       <Navbar/>
//     </div>
    
//   )
// }

// export default Profile

import React, { useState } from 'react';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    fullName: 'Alex Hartman',
    email: 'alex.hartman@example.com',
  });
  const [autoStart, setAutoStart] = useState(true);
  const [lang, setLang] = useState('English (US)');
  const [apiKey] = useState('*');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#181c22',
      color: '#fff',
      fontFamily: 'Inter, Arial, sans-serif',
      padding: 0,
      margin: 0,
    }}>
      <div style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: '50px 24px 32px 24px'
      }}>
        {/* Profile Section */}
        <h2 style={{ fontWeight: 600, fontSize: 28, marginBottom: 20 }}>Profile</h2>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
          <img src="https://randomuser.me/api/portraits/men/75.jpg"
               alt="Profile"
               style={{ width: 72, height: 72, borderRadius: '50%', marginRight: 24 }} />
          <div>
            <div style={{ color: '#fff', fontWeight: 500, fontSize: 16 }}>Profile Picture</div>
            <div style={{ color: '#a2a9b6', fontSize: 14 }}>Update your photo</div>
          </div>
          <button style={{
            marginLeft: 30,
            background: '#262e3e', color: '#c9d6ea', border: 'none',
            padding: '8px 18px', borderRadius: 6, fontWeight: 500,
            cursor: 'pointer'
          }}>Upload</button>
        </div>
        <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#a2a9b6', fontSize: 13, marginBottom: 4 }}>Full Name</div>
            <input style={{
              width: '100%',
              borderRadius: 7,
              border: 'none',
              padding: '12px 15px',
              background: '#212635',
              color: '#fff',
              fontSize: 16
            }}
                   value={profile.fullName}
                   onChange={e => setProfile({ ...profile, fullName: e.target.value })}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#a2a9b6', fontSize: 13, marginBottom: 4 }}>Email Address</div>
            <input style={{
              width: '100%',
              borderRadius: 7,
              border: 'none',
              padding: '12px 15px',
              background: '#212635',
              color: '#fff',
              fontSize: 16
            }}
                   value={profile.email}
                   type="email"
                   onChange={e => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
        </div>
        <button style={{
          marginTop: 8,
          background: '#25487a', color: '#fff', border: 'none',
          padding: '10px 26px', borderRadius: 6, fontWeight: 500,
          cursor: 'pointer', fontSize: 15
        }}>Update Profile</button>

        {/* Preferences Section */}
        <h2 style={{ fontWeight: 600, fontSize: 26, margin: '46px 0 12px 0' }}>Default Meeting Preferences</h2>
        <div style={{
          background: '#20232e',
          borderRadius: 9,
          padding: '30px 24px 24px 24px',
          marginBottom: 20
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 22
          }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 500 }}>Auto-start recording</div>
              <div style={{ color: '#a2a9b6', fontSize: 13, marginTop: 2 }}>Automatically start recording when a new meeting begins.</div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={autoStart}
                onChange={() => setAutoStart(v => !v)}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#a2a9b6', fontSize: 13, marginBottom: 5 }}>Default transcription language</div>
            <select value={lang}
                    onChange={e => setLang(e.target.value)}
                    style={{
                      width: 220,
                      padding: '12px 10px',
                      borderRadius: 7,
                      border: 'none',
                      background: '#212635',
                      color: '#fff',
                      fontSize: 16
                    }}>
              <option>English (US)</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
          <button style={{
            background: '#3772f2', color: '#fff', border: 'none',
            padding: '10px 26px', borderRadius: 6, fontWeight: 500,
            cursor: 'pointer', fontSize: 15
          }}>Save Preferences</button>
        </div>

        {/* Integrations Section */}
        <h2 style={{ fontWeight: 600, fontSize: 26, margin: '38px 0 15px 0' }}>Integrations &amp; API</h2>
        <div style={{
          display: 'flex', gap: 22, marginBottom: 28,
          flexWrap: 'wrap'
        }}>
          <div style={{
            background: '#232734', borderRadius: 8,
            padding: '18px 22px', flex: 1, minWidth: 220
          }}>
            <div style={{ fontSize: 16, color: '#fff', fontWeight: 500 }}>Google Calendar</div>
            <div style={{ fontSize: 14, color: '#67eab9', margin: '8px 0 8px 0' }}>Connected</div>
            <button style={{
              background: 'transparent', color: '#ed5c60', border: 'none',
              fontWeight: 500, cursor: 'pointer', fontSize: 15
            }}>Disconnect</button>
          </div>
          <div style={{
            background: '#232734', borderRadius: 8,
            padding: '18px 22px', flex: 1, minWidth: 220
          }}>
            <div style={{ fontSize: 16, color: '#fff', fontWeight: 500 }}>Slack</div>
            <div style={{ fontSize: 14, color: '#babfc7', margin: '8px 0 8px 0' }}>Not Connected</div>
            <button style={{
              background: '#393c44', color: '#fff', border: 'none',
              fontWeight: 500, cursor: 'pointer', fontSize: 15, borderRadius: 5,
              padding: '5px 18px'
            }}>Connect</button>
          </div>
        </div>
        {/* API Key Section */}
        <div>
          <div style={{ color: '#babfc7', fontSize: 14, marginBottom: 6 }}>
            Use this key to integrate TalkNote with your custom applications.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input style={{
              flex: 1,
              borderRadius: 7,
              border: 'none',
              padding: '12px 15px',
              background: '#212635',
              color: '#fff',
              fontSize: 17
            }}
                   value={apiKey}
                   type="text"
                   readOnly
            />
            <button style={{
              background: '#353e54',
              color: '#fff', border: 'none', fontWeight: 500,
              cursor: 'pointer', fontSize: 14, borderRadius: 6,
              padding: '10px 20px'
            }}>Regenerate</button>
          </div>
        </div>
      </div>

      {/* Custom toggle CSS for the switch */}
      <style>
        {`
        .switch { position: relative; display: inline-block; width: 45px; height: 26px;}
        .switch input { opacity: 0; width: 0; height: 0;}
        .slider {
          position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
          background-color: #40485b; transition: .4s; border-radius: 28px;
        }
        .switch input:checked + .slider { background-color: #3772f2;}
        .slider:before {
          position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px;
          background-color: white; transition: .4s; border-radius: 50%;
        }
        .switch input:checked + .slider:before { transform: translateX(18px);}
        `}
      </style>
    </div>
  );
};

export default ProfilePage;