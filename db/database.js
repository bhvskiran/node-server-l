const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then((data) => {
      console.log(`mongodb connected with server: ${data.connection.host}`);
    })
    .catch((error) => {
      console.log(
        `monggodb doesn't connect with server due to some error: ${error}`
      );
    });
};

module.exports = connectDatabase;
