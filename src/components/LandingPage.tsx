import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Zap, Eye, Download, Users, Code, Shield, Play, Star, Github } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Hero Section */}
      <header className="py-12 md:py-20 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full font-semibold text-lg shadow-lg">
              <Database className="w-6 h-6 mr-2" /> Linka v2.0
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Visualiza tus bases de datos de <span className="text-blue-600 dark:text-blue-400">Notion</span> <br /> como nunca antes
          </h1>
          <p className="text-lg md:text-2xl text-gray-700 dark:text-gray-200 mb-8">
            Explora relaciones, estadísticas y conexiones de tus datos de Notion en un diagrama interactivo, intuitivo y hermoso.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/app"
              className="inline-flex items-center bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Play className="w-5 h-5 mr-2" />
              Probar Demo
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
            >
              <Github className="w-5 h-5 mr-2" />
              Ver en GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
          Características que hacen única a Linka
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center">
            <Zap className="w-10 h-10 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Modo Demo Instantáneo</h3>
            <p className="text-gray-600 dark:text-gray-300">Prueba todas las funciones con datos de ejemplo, sin cuenta de Notion.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Eye className="w-10 h-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Visualiza Relaciones</h3>
            <p className="text-gray-600 dark:text-gray-300">Descubre cómo se conectan tus bases de datos de un vistazo, con animaciones.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Download className="w-10 h-10 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Exporta Diagramas</h3>
            <p className="text-gray-600 dark:text-gray-300">Exporta tu workspace como imágenes de alta calidad para documentación o compartir.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Users className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Listo para Equipos</h3>
            <p className="text-gray-600 dark:text-gray-300">Perfecto para equipos que gestionan workspaces complejos de Notion.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Code className="w-10 h-10 text-gray-700 dark:text-gray-200 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Código Abierto</h3>
            <p className="text-gray-600 dark:text-gray-300">Totalmente open source y personalizable para tus necesidades.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Shield className="w-10 h-10 text-teal-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Seguro y Privado</h3>
            <p className="text-gray-600 dark:text-gray-300">Tu token de Notion nunca se almacena. Todo el procesamiento es serverless y seguro.</p>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Prueba la Demo Interactiva
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Explora todas las funciones al instante con datos de ejemplo, o conecta tu propio workspace de Notion en segundos.
          </p>
          <Link
            to="/app"
            className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Play className="w-5 h-5 mr-2" />
            Probar Demo Ahora
          </Link>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
          100% Gratis y Open Source
        </h2>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-10 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2">
              <Star className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gratis para siempre</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Sin cuotas ocultas, sin suscripciones. Todas las funciones disponibles para todos.
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
            >
              <Github className="w-5 h-5 mr-2" />
              Ver en GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <p>
            &copy; {new Date().getFullYear()} Linka v2.0 &mdash; Visualiza tus bases de datos de Notion.
            <span className="ml-2">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">GitHub</a>
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 