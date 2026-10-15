/**
 * Vite Dev Server Authoring Middleware
 * 
 * Secure server-side routes:
 * GET  /api/authoring/status
 * POST /api/authoring/improve
 * POST /api/authoring/validate
 */

const { OpenAIAuthoringService } = require('./openaiService.cjs');

function authoringPlugin() {
  const service = new OpenAIAuthoringService();

  return {
    name: 'codolingo-authoring-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/authoring')) {
          return next();
        }

        // Set secure headers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');

        // Handle GET /api/authoring/status
        if (req.method === 'GET' && req.url === '/api/authoring/status') {
          return res.end(JSON.stringify({
            status: 'ok',
            isConfigured: service.isConfigured(),
            model: service.model,
            message: service.isConfigured()
              ? 'OpenAI authoring engine ready.'
              : 'OpenAI API key is unconfigured or placeholder in .env. Curriculum authoring running in offline review mode.'
          }));
        }

        // Handle POST /api/authoring/improve
        if (req.method === 'POST' && req.url === '/api/authoring/improve') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
            if (body.length > 100000) {
              res.statusCode = 413;
              res.end(JSON.stringify({ error: 'Payload too large (limit 100KB)' }));
              req.destroy();
            }
          });

          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const exerciseData = data.exerciseData;
              if (!exerciseData) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Missing exerciseData in request body' }));
              }

              const result = await service.improveExercise(exerciseData);
              return res.end(JSON.stringify(result));
            } catch (err) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message || 'Internal authoring error' }));
            }
          });
          return;
        }

        // 404 for unknown authoring route
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Authoring route not found' }));
      });
    }
  };
}

module.exports = {
  authoringPlugin
};
