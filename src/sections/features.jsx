import React from 'react';

const styles = {
    sectionContainer: {
        backgroundColor: '#09031c',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        padding: '0 20px 50px 20px'
    },
    heroBanner: {
        maxWidth: '1200px',
        margin: '0 auto 50px auto',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        height: '450px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '50px 20px',
        textAlign: 'center',
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(path/to/image_aecdae.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    },
    heroContent: {
        zIndex: 1
    },
    h2: {
        fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
        fontWeight: '700',
        marginBottom: '10px'
    },
    subtitle: {
        fontSize: 'clamp(1rem, 1.5vw, 1.15rem)',
        color: 'rgba(255, 255, 255, 0.8)',
        maxWidth: '600px',
        marginBottom: '25px'
    },
    ctaButton: {
        padding: '12px 30px',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        backgroundColor: '#007aff',
        color: '#ffffff'
    },
    featuresHeader: {
        maxWidth: '1200px',
        margin: '0 auto 20px auto',
        fontSize: '1.5rem',
        fontWeight: '700'
    },
    featuresGrid: {
        maxWidth: '1200px',
        margin: '0 auto 80px auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
    },
    featureCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: '30px',
        borderRadius: '8px',
        textAlign: 'left'
    },
    featureTitle: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '10px'
    },
    icon: {
        marginRight: '10px',
        fontSize: '1.5rem',
        color: '#007aff'
    },
    featureText: {
        fontSize: '0.95rem',
        color: 'rgba(255, 255, 255, 0.7)'
    },
    footer: {
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.9rem',
        color: 'rgba(255, 255, 255, 0.5)'
    },
    copyright: {
        textAlign: 'center',
        width: '100%',
        marginTop: '20px'
    },
    footerLink: {
        color: 'rgba(255, 255, 255, 0.5)',
        textDecoration: 'none'
    }
};

const featuresData = [
    { icon: '🎤', title: 'Real-Time Transcription', description: 'Instantly transcribe your speech into text as you speak, ensuring no word is missed.' },
    { icon: '🔎', title: 'Smart Search', description: 'Quickly find any moment in your recordings or transcripts with our powerful search functionality.' },
    { icon: '☁️', title: 'Cloud Sync', description: 'Access your notes and recordings from any device with seamless cloud synchronization.' },
    { icon: '🔒', title: 'Secure and Private', description: 'Your data is protected with end-to-end encryption, ensuring your privacy and security.' }
];

const Features = () => {
    return (
        <div style={styles.sectionContainer}>
            <div style={styles.heroBanner}>
                <div style={styles.heroContent}>
                    <h2 style={styles.h2}>
                        TalkNote: Capture Every Word Effortlessly
                    </h2>
                    <p style={styles.subtitle}>
                        Transform your spoken words into accurate, searchable text with TalkNote. Perfect for meetings, lectures, and personal notes.
                    </p>
                    <button style={styles.ctaButton}>
                        Get Started
                    </button>
                </div>
            </div>

            <h3 style={styles.featuresHeader}>Key Features</h3>
            
            <div style={styles.featuresGrid}>
                {featuresData.map((feature, index) => (
                    <div key={index} style={styles.featureCard}>
                        <div style={styles.featureTitle}>
                            <span style={styles.icon}>{feature.icon}</span>
                            {feature.title}
                        </div>
                        <p style={styles.featureText}>{feature.description}</p>
                    </div>
                ))}
            </div>

            <div style={styles.footer}>
                <a href="#" style={styles.footerLink}>Terms of Service</a>
                <a href="#" style={styles.footerLink}>Privacy Policy</a>
            </div>
            <div style={styles.copyright}>
                ©2024 TalkNote. All rights reserved.
            </div>
        </div>
    );
};

export default Features;