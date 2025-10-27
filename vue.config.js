const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' ? '././' : '',
  devServer: {
    proxy: {
      '/api/web': {
        target: 'http://51.38.114.8/csp/csi/restapi/csi',
        changeOrigin: true,
        secure: false,
        pathRewrite: { '^/api/web': '' },
        logLevel: 'debug',
        onProxyReq(proxyReq, req, res) {
          console.log(`➡️  Proxying request: ${req.method} ${req.originalUrl} → ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
        },
        onProxyRes(proxyRes, req, res) {
          console.log(`⬅️  Response from target (${proxyRes.statusCode}) for ${req.method} ${req.originalUrl}`);
        },
        onError(err, req, res) {
          console.error('❌ Proxy error:', err.message);
        }
      },
      '/api/d2': {
        target: 'http://51.38.114.8/csp/csi/restapi/d2',
        changeOrigin: true,
        secure: false,
        pathRewrite: { '^/api/d2': '' },
        logLevel: 'debug',
        onProxyReq(proxyReq, req, res) {
          console.log(`➡️  Proxying request: ${req.method} ${req.originalUrl} → ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
        },
        onProxyRes(proxyRes, req, res) {
          console.log(`⬅️  Response from target (${proxyRes.statusCode}) for ${req.method} ${req.originalUrl}`);
        },
        onError(err, req, res) {
          console.error('❌ Proxy error:', err.message);
        }
      }
    }
  }
});
