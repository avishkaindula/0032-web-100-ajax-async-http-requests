// const mongodb = require('mongodb');

// const MongoClient = mongodb.MongoClient;

// let database;

// async function connect() {
//   const client = await MongoClient.connect('mongodb://localhost:27017');
//   database = client.db('blog');
// }

// function getDb() {
//   if (!database) {
//     throw { message: 'Database connection not established!' };
//   }
//   return database;
// }

// module.exports = {
//   connectToDatabase: connect,
//   getDb: getDb
// };

const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

let database;

async function connect() {
  const uri =
    "mongodb+srv://avishka_indula:p7iGGaREtxbhN3t3@cluster0.ibnu8y4.mongodb.net/?retryWrites=true&w=majority";

  const client = await MongoClient.connect(uri);
  database = client.db("blog");
}

function getDb() {
  if (!database) {
    throw { message: "Database connection not established!" };
  }
  // This is how we check whether the database hasn't been set or not.

  return database;
}

module.exports = {
  connectToDatabase: connect,
  getDb: getDb,
};
