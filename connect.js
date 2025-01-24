const mongoose = require('mongoose');



async function main(URL) {
  await mongoose.connect(URL);

}

module.exports = main;