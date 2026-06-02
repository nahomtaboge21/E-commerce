module.exports = {
  apps: [
    {
      name: 'shopwave',
      script: './server.js',
      cwd: __dirname + '/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
