const { MongoClient, ObjectId } = require('mongodb');

// Connection URL
const url = 'mongodb://root:rootpwd@localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'ufcwebauth';

var user_collection;
var car_collection;

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to Mongo server');
  const db = client.db(dbName);
  user_collection = db.collection('user');
  car_collection = db.collection('cars');

  return 'done.';
}

main()
  .then(console.log)
  .catch(console.error);
//   .finally(() => client.close());
async function getUsers(email) {
  const findResult = await user_collection.find({ email: email }).toArray();
  return findResult;
}

async function addUser(userData) {
  const result = await user_collection.insertOne(userData);
  return result.insertedId;
}

async function getUserById(userId) {

  const user = await user_collection.findOne({  _id: new ObjectId(userId) });
  return user;
}

async function getCarById(carId) {
  
  const car = await car_collection.findOne({ _id: new ObjectId(carId) });
  return car;
}

async function getAllCars() {
  const cars = await car_collection.find().toArray();
  return cars;
}

async function addCar(carData) {
  const result = await car_collection.insertOne(carData);
  return result.insertedId;
}

async function updateCar(carId, carData) {
  const result = await car_collection.updateOne({ _id: carId }, { $set: carData });
  return result.modifiedCount;
}

async function deleteCar(carId) {
  const result = await car_collection.deleteOne({ _id: carId });
  return result.deletedCount;
}


exports.getCarById = getCarById;
exports.getAllCars = getAllCars;
exports.addCar = addCar;
exports.updateCar = updateCar;
exports.deleteCar = deleteCar;
exports.getUsers = getUsers;
exports.addUser = addUser;
exports.getUserById = getUserById;