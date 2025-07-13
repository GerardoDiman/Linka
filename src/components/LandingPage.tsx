import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Zap, ArrowRight, CheckCircle } from 'lucide-react';

const HeroIllustration = () => (
  <svg width="400" height="280" viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-lg mx-auto md:mx-0">
    <ellipse cx="200" cy="240" rx="180" ry="30" fill="#E0F2FE" />
    <rect x="120" y="80" width="160" height="100" rx="20" fill="#F1F5F9" />
    <rect x="140" y="100" width="120" height="60" rx="12" fill="#A5B4FC" />
    <circle cx="200" cy="130" r="18" fill="#38BDF8" />
    <rect x="170" y="160" width="60" height="12" rx="6" fill="#818CF8" />
    <rect x="180" y="180" width="40" height="8" rx="4" fill="#F472B6" />
    <rect x="195" y="195" width="10" height="10" rx="5" fill="#34D399" />
  </svg>
);

const HeroSection = () => (
  <section className="relative bg-white overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
    <div className="absolute inset-0 pointer-events-none">
      <svg width="100%" height="100%" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 w-full h-64 opacity-40">
        <path fill="#E0F2FE" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" />
      </svg>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
      <div className="w-full md:w-1/2 text-center md:text-left">
        <span className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Zap className="w-4 h-4 mr-2" /> Visualize Notion Databases
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          Visualiza tus datos de <span className="text-blue-600">Notion</span> <br /> de forma simple y profesional
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl">
          Explora relaciones, estadísticas y conexiones de tus bases de datos de Notion en un diagrama interactivo, intuitivo y hermoso. Sin configuración compleja.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <Link
            to="/app"
            className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-teal-400 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-md hover:from-blue-600 hover:to-teal-500 transition-all duration-200"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Probar Demo
          </Link>
        </div>
        <div className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
          <span className="inline-flex items-center bg-white border border-gray-200 px-4 py-2 rounded-full text-sm text-gray-700 shadow-sm">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Gratis para siempre
          </span>
          <span className="inline-flex items-center bg-white border border-gray-200 px-4 py-2 rounded-full text-sm text-gray-700 shadow-sm">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Sin configuración
          </span>
          <span className="inline-flex items-center bg-white border border-gray-200 px-4 py-2 rounded-full text-sm text-gray-700 shadow-sm">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Open Source
          </span>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex justify-center md:justify-end">
        <HeroIllustration />
      </div>
    </div>
  </section>
);

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />
      {/* Aquí puedes seguir agregando secciones: Oferta, Features, Beneficios, etc. */}
    </div>
  );
};

export default LandingPage; 