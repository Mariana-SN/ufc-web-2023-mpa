const { MongoClient, ObjectId } = require('mongodb');

// Connection URL
const url = 'mongodb://root:rootpwd@localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'ufcwebmpa';

var user_collection;
var car_collection;
var lease_collection;

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to Mongo server');
  const db = client.db(dbName);
  user_collection = db.collection('user');
  car_collection = db.collection('cars');
  lease_collection = db.collection('lease');

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

async function updateUser(userId, userData) {
  const result = await user_collection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: userData }
  );
  return result.modifiedCount;
}

async function updateUserPassword(userId, newPassword) {
  const result = await user_collection.updateOne(

    { _id: new ObjectId(userId) },
    { $set: { password: newPassword } }

  );

  return result.modifiedCount;
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
  const result = await car_collection.updateOne({  _id: new ObjectId(carId)  }, { $set: carData });
  return result.modifiedCount;
}

async function deleteCar(carId) {
  const result = await car_collection.deleteOne({ _id: new ObjectId(carId) });
  return result.deletedCount;
}

async function addLease(leaseData) {
  const result = await lease_collection.insertOne(leaseData);
  return result.insertedId;
}

async function updateCarStatus(carId, newStatus) {
  const result = await car_collection.updateOne({  _id: new ObjectId(carId)  }, { $set: { available: newStatus } });
  return result.modifiedCount;
}

async function getAllLeaseByUserId(UserId) {
  const user = await lease_collection.find({  userId: UserId }).toArray();
  return user;
}

async function updateLeaseAvailable(leaseId, newavailable) {
  const result = await lease_collection.updateOne({  _id: new ObjectId(leaseId)  }, { $set: { available: newavailable } });
  return result.modifiedCount;
}

async function getAllLease(UserId) {
  const lease = await lease_collection.find().toArray();
  return lease;
}

exports.getCarById = getCarById;
exports.getAllCars = getAllCars;
exports.addCar = addCar;
exports.updateCar = updateCar;
exports.deleteCar = deleteCar;
exports.updateCarStatus = updateCarStatus;

exports.getUsers = getUsers;
exports.addUser = addUser;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.updateUserPassword = updateUserPassword;

exports.addLease = addLease;
exports.getAllLeaseByUserId = getAllLeaseByUserId;
exports.updateLeaseAvailable = updateLeaseAvailable
exports.getAllLease = getAllLease