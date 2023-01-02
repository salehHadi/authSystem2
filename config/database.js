const mongoose = require('mongoose');


exports.connect = async () => {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then((res) => {
        console.log(
          'Connected to Distribution API Database - Initial Connection'
        );
      })
      .catch((err) => {
        console.log(
          `Initial Distribution API Database connection error occured -`,
          err
        );
        process.exit(1);
      });
}