module.exports = {
  apps: [
    {
      name: 'metromate-api',
      script: './dist/api/server.js',
      instances: 'max', // or a specific number like 2
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
