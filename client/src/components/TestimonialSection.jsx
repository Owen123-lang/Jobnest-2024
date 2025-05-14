import React from 'react';

function TestimonialSection() {
  const testimonials = [
    {
      id: 1,
      name: "Dian Sastrowardoyo",
      role: "UI/UX Designer",
      company: "Tech Indonesia",
      image: "https://randomuser.me/api/portraits/women/32.jpg",
      quote: "JobNest membantu saya menemukan pekerjaan impian dalam waktu kurang dari sebulan. Antarmuka yang intuitif dan fitur pencarian yang canggih memudahkan saya menemukan posisi yang sesuai dengan keahlian saya."
    },
    {
      id: 2,
      name: "Budi Santoso",
      role: "Software Engineer",
      company: "Global Tech",
      image: "https://randomuser.me/api/portraits/men/54.jpg",
      quote: "Setelah mendaftar di JobNest, saya mendapatkan tawaran dari 3 perusahaan berbeda dalam waktu 2 minggu. Platform ini benar-benar memahami kebutuhan pencari kerja dan perusahaan."
    },
    {
      id: 3,
      name: "Anisa Rahman",
      role: "Marketing Manager",
      company: "Creative Solutions",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      quote: "JobNest adalah platform pencarian kerja terbaik yang pernah saya gunakan. Berkat JobNest, saya berhasil pindah ke perusahaan yang lebih sesuai dengan passion saya dengan gaji yang lebih baik."
    }
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Apa Kata Mereka</h2>
          <p className="mt-4 text-lg text-gray-600">
            Pengalaman para pencari kerja yang berhasil menemukan pekerjaan melalui JobNest
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-white p-6 rounded-lg shadow-md flex flex-col"
            >
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.role} di {testimonial.company}</p>
                </div>
              </div>
              <blockquote className="flex-grow">
                <p className="text-gray-700 text-sm leading-relaxed">"{testimonial.quote}"</p>
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TestimonialSection;