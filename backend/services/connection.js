var mongoose = require("mongoose");
var config = require("config");
let tool = require("./tool");

//database connection
mongoose.Promise = global.Promise;
const options = {
  autoIndex: false,
  maxPoolSize: 10,
  useNewUrlParser: true,
  wtimeoutMS: 2500,
};

mongoose
  .connect(config.get("mongodb.connectionString"), options)
  .then(() => {
    console.log("connected to mongoDB");
    // tool.createadmin();
  })
  .catch((err) => {
    console.log(
      "Error connecting to database",
      err,
      "mongouri",
      config.get("mongodb.connectionString")
    );
  });

module.exports = mongoose;
