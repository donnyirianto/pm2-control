module.exports = {
  apps : [{
      name: "pm2-control",
      script: "./server.js", 
      autorestart: true,
      max_memory_restart: "1G"
    },
  ],
  env: {
    NODE_ENV: 'development'
  },
  env_production: {
    NODE_ENV: 'production'
  }
};
