module.exports = {
  apps: [{
    name: "protection-api",
    script: "dist/server/index.js",
    instances: "max",
    exec_mode: "cluster",
    autorestart: true,
    watch: false,
    max_memory_restart: "512M",
    env: { NODE_ENV: "production", PORT: 3001 },
  }],
}
