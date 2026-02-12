import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
    heroSection: {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: '#ffffff',
        backgroundColor: '#09031c',
        backgroundImage: 'radial-gradient(circle at center, rgba(30, 0, 70, 0.5) 0%, rgba(0, 0, 0, 0) 70%)',
        padding: '20px'
    },
    contentContainer: {
        maxWidth: '700px',
        width: '100%'
    },
    logo: {
        display: 'inline-flex',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '4px 10px',
        borderRadius: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        fontSize: '0.9em',
        fontWeight: '600'
    },
    dot: {
        height: '6px',
        width: '6px',
        backgroundColor: '#03a9f4',
        borderRadius: '50%',
        display: 'inline-block',
        marginRight: '5px'
    },
    h1: {
        fontSize: 'clamp(2.5rem, 6vw, 5rem)',
        lineHeight: '1.1',
        marginBottom: '15px',
        fontWeight: '800'
    },
    highlight: {
        background: 'linear-gradient(90deg, #e590ff 0%, #03a9f4 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textFillColor: 'transparent'
    },
    p: {
        fontSize: 'clamp(1rem, 2vw, 1.25rem)',
        color: 'rgba(255, 255, 255, 0.7)',
        margin: '0 auto 40px',
        maxWidth: '550px'
    },
    ctaButtons: {
        display: 'flex',
        justifyContent: 'center',
        gap: '15px'
    },
    btn: {
        padding: '14px 28px',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'transform 0.2s, opacity 0.2s'
    },
    primaryBtn: {
        backgroundColor: '#ffffff',
        color: '#09031c'
    },
    secondaryBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.3)'
    }
};

const Hero = () => {
    return (
        <div style={styles.heroSection}>
            <div style={styles.contentContainer}>
                <div style={styles.logo}>
                    <span style={styles.dot}></span>TalkNote
                </div>
                <h1 style={styles.h1}>
                    Capture Every <span style={styles.highlight}>Conversation</span>
                </h1>
                <p style={styles.p}>
                    TalkNote captures your spoken ideas, lectures, and meetings, and automatically organizes them into clear, actionable text.
                </p>
                <div style={styles.ctaButtons}>
                    {/* Button 1: Start for Free */}
                    <Link to="/Meetings" style={{ textDecoration: 'none' }}>
                      <button style={{...styles.btn, ...styles.primaryBtn}}>
                        Start for Free
                      </button>
                    </Link>
                    
                    {/* Button 2: Book a Demo */}
                    <Link to="/Meetings" style={{ textDecoration: 'none' }}>
                      <button style={{...styles.btn, ...styles.secondaryBtn}}>
                        Book a Demo
                      </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Hero;