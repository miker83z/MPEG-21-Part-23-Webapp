module.exports = {
  port: 8022, //process.env.PORT,
  files: ['.src/**/*.{html,htm,css,js,ttl}'],
  server: {
    baseDir: [
      './src',
      './node_modules/ethereum-smart-contracts-for-media/smart-contract-template/build/contracts',
    ],
  },
  ghostMode: false,
  open: false,
};
