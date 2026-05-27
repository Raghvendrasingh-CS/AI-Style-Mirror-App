const { defineConfig } = require('vite');
const { predictFit } = require('./fit-ml-engine.js');

module.exports = defineConfig({
  server: {
    port: 3000,
    open: true
  },
  plugins: [
    {
      name: 'fit-predictor-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/predict-fit' && req.method === 'POST') {
            let rawData = '';
            req.on('data', chunk => {
              rawData += chunk;
            });
            req.on('end', () => {
              try {
                const reqBody = JSON.parse(rawData);
                if (!reqBody.body || !reqBody.garment) {
                  throw new Error('Missing body or garment measurements');
                }
                const prediction = predictFit(reqBody.body, reqBody.garment);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(prediction));
              } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ]
});
