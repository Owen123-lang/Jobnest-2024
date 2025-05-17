import React from 'react';
import Navbar from '../components/Navbar';

const testimonials = [
  {
    name: "Dian Sastrowardoyo",
    role: "UI/UX Designer di Tech Indonesia",
    message: `JobNest membantu saya menemukan pekerjaan impian dalam waktu kurang dari sebulan.
Antarmuka yang intuitif dan fitur pencarian yang canggih memudahkan saya menemukan posisi yang sesuai dengan keahlian saya.`,
    avatar: "https://randomuser.me/api/portraits/women/32.jpg"
  },
  {
    name: "Budi Santoso",
    role: "Software Engineer di Global Tech",
    message: `Setelah mendaftar di JobNest, saya mendapatkan tawaran dari 3 perusahaan berbeda dalam waktu 2 minggu.
Platform ini benar-benar memahami kebutuhan pencari kerja dan perusahaan.`,
    avatar: "https://randomuser.me/api/portraits/men/54.jpg"
  },
  {
    name: "Anisa Rahman",
    role: "Marketing Manager di Creative Solutions",
    message: `JobNest adalah platform pencarian kerja terbaik yang pernah saya gunakan.
Berkat JobNest, saya berhasil pindah ke perusahaan yang lebih sesuai dengan passion saya dengan gaji yang lebih baik.`,
    avatar: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    name: "Andi Pratama",
    role: "Pencari Kerja",
    message: "JobNest sangat membantu saya menemukan pekerjaan impian dengan mudah dan cepat. Fitur notifikasinya sangat membantu!",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    name: "Siti Rahma",
    role: "HRD Perusahaan",
    message: "Platform ini memudahkan kami menemukan kandidat terbaik. Proses rekrutmen jadi lebih efisien!",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  }
];

const Testimonials = () => (
  <>
    <Navbar />
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eaf3ff 60%, #f9f9fb 100%)',
      padding: '3rem 1rem'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        background: 'transparent',
        borderRadius: 24,
        padding: '2.5rem 0'
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#4f8cff',
          fontWeight: 800,
          fontSize: 36,
          marginBottom: 32,
          letterSpacing: 1
        }}>
          Apa Kata Mereka Tentang <span style={{ color: '#222' }}>JobNest</span>
        </h1>
        <div style={{
          display: 'flex',
          gap: 32,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {testimonials.map((t, idx) => (
            <div key={idx} style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 2px 12px rgba(79,140,255,0.07)',
              padding: '2.5rem 2rem',
              maxWidth: 370,
              flex: '1 1 320px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <img
                src={t.avatar}
                alt={t.name}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  border: '3px solid #4f8cff',
                  marginBottom: 16,
                  objectFit: 'cover'
                }}
              />
              <h3 style={{
                margin: 0,
                color: '#222',
                fontWeight: 700,
                fontSize: 22,
                textAlign: 'center'
              }}>{t.name}</h3>
              <span style={{
                fontSize: 15,
                color: '#222',
                fontWeight: 500,
                marginBottom: 18,
                textAlign: 'center'
              }}>{t.role}</span>
              <p style={{
                color: '#444',
                fontSize: 16,
                textAlign: 'center',
                fontStyle: 'italic',
                lineHeight: 1.7
              }}>
                "{t.message}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);

export default Testimonials;