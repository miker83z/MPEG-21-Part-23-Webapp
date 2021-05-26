module.exports = {
  port: 8022, //process.env.PORT,
  files: ['.src/**/*.{html,htm,css,js,ttl}'],
  server: {
    baseDir: ['./src'],
  },
  ghostMode: false,
  open: false,
};
