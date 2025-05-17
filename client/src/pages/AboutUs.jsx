import React from 'react';
import Navbar from '../components/Navbar';

const AboutUs = () => (
  <>
    <Navbar />
    <div
      className="about-us-container"
      style={{
        padding: '2.5rem',
        maxWidth: 950,
        margin: '2.5rem auto',
        background: 'linear-gradient(135deg, #eaf3ff 60%, #f9f9fb 100%)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(79,140,255,0.10)',
        fontFamily: 'Segoe UI, Arial, sans-serif',
        border: '1.5px solid #e0eaff'
      }}
    >
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="Jobnest Logo"
          style={{
            width: 130,
            height: 130,
            borderRadius: '50%',
            border: '5px solid #4f8cff',
            background: '#fff',
            boxShadow: '0 2px 16px rgba(79,140,255,0.10)'
          }}
        />
        <div>
          <span style={{
            display: 'inline-block',
            background: 'linear-gradient(90deg, #4f8cff 60%, #6ee7b7 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 8,
            padding: '4px 16px',
            marginBottom: 10,
            letterSpacing: 1
          }}>
            Platform Karir Masa Depan
          </span>
          <h1 style={{ color: '#4f8cff', marginBottom: 10, fontSize: 36, fontWeight: 800, letterSpacing: 1 }}>
            Tentang <span style={{ color: '#4f8cff' }}>Jobnest</span>
          </h1>
          <p style={{ fontSize: 19, color: '#444', marginBottom: 0, lineHeight: 1.7 }}>
            <strong>Jobnest</strong> adalah platform inovatif yang menghubungkan pencari kerja dengan perusahaan impian mereka.
            Kami berkomitmen memberikan pengalaman terbaik dalam mencari dan menawarkan pekerjaan, serta membangun ekosistem karir yang inklusif dan modern.
          </p>
        </div>
      </div>
      <div style={{ marginTop: 40, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
      </div>
      <div
        style={{
          background: 'linear-gradient(90deg, #4f8cff 60%, #6ee7b7 100%)',
          borderRadius: 16,
          padding: '2rem',
          marginTop: 40,
          textAlign: 'center',
          color: '#fff',
          fontWeight: 600,
          fontSize: 20,
          letterSpacing: 1
        }}
      >
        <span role="img" aria-label="rocket" style={{ fontSize: 28, marginRight: 10 }}>🚀</span>
        Bergabunglah bersama kami dan wujudkan karir impian Anda bersama <span style={{ color: '#fff', fontWeight: 700 }}>Jobnest</span>!
      </div>
    </div>
  </>
);

export default AboutUs;