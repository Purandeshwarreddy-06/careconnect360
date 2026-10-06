// Curated high quality healthcare images with dark theme compatibility and fallback SVG support

export const HEALTHCARE_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80',
  caregiver: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=1000&q=80',
  doctorConsultation: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
  doctorMale: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
  healthMonitoring: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1000&q=80',
  emergencyResponse: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=1000&q=80',
  medications: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80',
};

// SVG Fallback data URI in case image fails to load
export const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%2308111f'/%3E%3Ccircle cx='400' cy='200' r='80' fill='%23101827' stroke='%232563eb' stroke-width='4'/%3E%3Cpath d='M380 200h40M400 180v40' stroke='%2338bdf8' stroke-width='6' stroke-linecap='round'/%3E%3Ctext x='400' y='320' fill='%2394a3b8' font-size='18' text-anchor='middle' font-family='sans-serif'%3ECareConnect 360%3C/text%3E%3C/svg%3E";
