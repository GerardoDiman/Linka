import { useState } from 'react';
import { apiFetch } from '../services/api';
import { toast } from 'react-hot-toast';

const WebhookTest = () => {
  const [event, setEvent] = useState('');
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTestWebhook = async () => {
    if (!event.trim()) {
      toast.error('Por favor ingresa un evento');
      return;
    }

    setLoading(true);
    try {
      let parsedData = {};
      if (data.trim()) {
        try {
          parsedData = JSON.parse(data);
        } catch (error) {
          toast.error('JSON inválido en el campo de datos');
          return;
        }
      }

      const response = await apiFetch('/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, data: parsedData })
      });

      toast.success('Webhook enviado exitosamente');
      console.log('✅ Webhook enviado:', response);
    } catch (error) {
      console.error('❌ Error enviando webhook:', error);
      toast.error('Error enviando webhook');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetWebhook = async (presetEvent: string, presetData: any) => {
    setEvent(presetEvent);
    setData(JSON.stringify(presetData, null, 2));
  };

  const presets = [
    {
      name: 'Nuevo Lead',
      event: 'new_lead',
      data: {
        email: 'test@example.com',
        name: 'Usuario Test',
        company: 'Empresa Test',
        role: 'CEO',
        source: 'Landing Page'
      }
    },
    {
      name: 'Usuario Registrado',
      event: 'user_registered',
      data: {
        email: 'usuario@example.com',
        name: 'Usuario Registrado',
        role: 'pending',
        userId: 123
      }
    },
    {
      name: 'Invitación Creada',
      event: 'invitation_created',
      data: {
        email: 'invitado@example.com',
        invitedBy: 54,
        invitationLink: 'http://localhost:3000/register?token=abc123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    {
      name: 'Estado Actualizado',
      event: 'user_status_updated',
      data: {
        userId: 123,
        oldStatus: 'pending',
        newStatus: 'approved',
        adminNotes: 'Usuario aprobado'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          🧪 Prueba de Webhooks
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de configuración */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Configuración del Webhook
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Evento
                </label>
                <input
                  type="text"
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  placeholder="new_lead, user_registered, etc."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Datos (JSON)
                </label>
                <textarea
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>

              <button
                onClick={handleTestWebhook}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Enviando...' : 'Enviar Webhook'}
              </button>
            </div>
          </div>

          {/* Panel de presets */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Presets de Prueba
            </h2>

            <div className="space-y-3">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetWebhook(preset.event, preset.data)}
                  className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {preset.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Evento: {preset.event}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                💡 Información
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Los webhooks se envían a n8n desde cualquier entorno (desarrollo y producción).
                Usa esta página para probar y configurar tus nodos de n8n.
              </p>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📋 Logs de Webhooks
          </h2>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Los logs aparecerán en la consola del navegador y en la terminal del servidor.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              URL de n8n: https://n8n.srv858616.hstgr.cloud/webhook/linka
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookTest; 