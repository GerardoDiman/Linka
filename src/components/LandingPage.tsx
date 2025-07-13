import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Zap, ArrowRight, CheckCircle, FileText, Layers, BarChart3 } from 'lucide-react';

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

const OfferSection = () => (
  <section className="py-16 bg-white">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Nuestra Oferta</h2>
      <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
        Te ayudamos a visualizar y entender la estructura de tus datos en Notion, facilitando la gestión y el análisis de tus bases de datos de manera profesional y sencilla.
      </p>
      <div className="flex flex-col md:flex-row justify-center gap-8">
        <div className="flex-1">
          <div className="flex flex-col items-center">
            <FileText className="w-10 h-10 text-blue-500 mb-2" />
            <h3 className="font-semibold text-lg text-gray-900 mb-1">Aprende</h3>
            <p className="text-gray-500 text-sm">Descubre cómo se relacionan tus datos y aprende a optimizar tu workspace.</p>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex flex-col items-center">
            <Layers className="w-10 h-10 text-teal-500 mb-2" />
            <h3 className="font-semibold text-lg text-gray-900 mb-1">Practica</h3>
            <p className="text-gray-500 text-sm">Experimenta con filtros, búsquedas y visualizaciones interactivas.</p>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex flex-col items-center">
            <BarChart3 className="w-10 h-10 text-purple-500 mb-2" />
            <h3 className="font-semibold text-lg text-gray-900 mb-1">Crece</h3>
            <p className="text-gray-500 text-sm">Toma mejores decisiones y haz crecer tus proyectos con datos claros.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const FeaturesSection = () => (
  <section className="py-16 bg-gray-50">
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Características</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Todo lo que necesitas para visualizar y entender tu workspace de Notion de manera profesional.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center text-center">
          <Database className="w-10 h-10 text-blue-500 mb-4" />
          <h3 className="font-semibold text-lg text-gray-900 mb-2">Visualización Interactiva</h3>
          <p className="text-gray-500 text-sm">Explora tus bases de datos y relaciones con nodos y conexiones animadas.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center text-center">
          <Zap className="w-10 h-10 text-teal-500 mb-4" />
          <h3 className="font-semibold text-lg text-gray-900 mb-2">Modo Demo Instantáneo</h3>
          <p className="text-gray-500 text-sm">Prueba todas las funciones con datos de ejemplo, sin cuenta de Notion.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center text-center">
          <Layers className="w-10 h-10 text-purple-500 mb-4" />
          <h3 className="font-semibold text-lg text-gray-900 mb-2">Filtros y Búsqueda</h3>
          <p className="text-gray-500 text-sm">Encuentra lo que necesitas con potentes filtros y búsqueda en tiempo real.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center text-center">
          <BarChart3 className="w-10 h-10 text-pink-500 mb-4" />
          <h3 className="font-semibold text-lg text-gray-900 mb-2">Estadísticas y Exportación</h3>
          <p className="text-gray-500 text-sm">Obtén insights, estadísticas y exporta diagramas de alta calidad.</p>
        </div>
      </div>
    </div>
  </section>
);

const BenefitsSection = () => (
  <section className="py-16 bg-white">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <img src="https://storyset.com/illustration/goal/bro" alt="Beneficios" className="w-full max-w-md mx-auto md:mx-0 rounded-2xl shadow-md" style={{background:'#F0F9FF'}} />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Beneficios</h2>
          <ul className="space-y-4 text-lg text-gray-700">
            <li className="flex items-center"><CheckCircle className="w-6 h-6 text-green-500 mr-3" /> Visualización clara y profesional</li>
            <li className="flex items-center"><CheckCircle className="w-6 h-6 text-green-500 mr-3" /> Ahorra tiempo en la gestión de datos</li>
            <li className="flex items-center"><CheckCircle className="w-6 h-6 text-green-500 mr-3" /> Sin curva de aprendizaje</li>
            <li className="flex items-center"><CheckCircle className="w-6 h-6 text-green-500 mr-3" /> Perfecto para equipos y freelancers</li>
            <li className="flex items-center"><CheckCircle className="w-6 h-6 text-green-500 mr-3" /> 100% gratis y open source</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const FinalCTASection = () => (
  <section className="py-16 bg-gradient-to-r from-blue-50 to-teal-100">
    <div className="max-w-3xl mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">¿Listo para visualizar tus datos de Notion?</h2>
      <p className="text-lg text-gray-700 mb-8">Empieza a explorar y entender tus bases de datos de manera profesional, gratis y sin complicaciones.</p>
      <Link
        to="/app"
        className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-teal-400 text-white px-10 py-5 rounded-xl font-semibold text-xl shadow-md hover:from-blue-600 hover:to-teal-500 transition-all duration-200"
      >
        Probar Demo Ahora
        <ArrowRight className="w-6 h-6 ml-2" />
      </Link>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-10 bg-white border-t border-gray-100 text-center text-gray-500 text-sm">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center justify-center gap-2">
        <Database className="w-6 h-6 text-blue-500" />
        <span className="font-bold text-gray-700">Linka v2.0</span>
      </div>
      <div>
        &copy; {new Date().getFullYear()} Linka. Visualiza Notion de forma profesional.
      </div>
      <div>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 underline">GitHub</a>
      </div>
    </div>
  </footer>
);

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <OfferSection />
      <FeaturesSection />
      <BenefitsSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};

export default LandingPage; 