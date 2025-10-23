const createFirebaseAdapter = require('../utils/FirebaseAdapter');

class User {
  constructor() {
    this.adapter = createFirebaseAdapter('users');
  }

  async create(userData) {
    const user = {
      email: userData.email,
      name: userData.name || '',
      country: userData.country || 'Kenya',
      roles: userData.roles || ['user'],
      active: userData.active !== false,
      createdAt: userData.createdAt || new Date().toISOString(),
      // Add other fields as needed
    };

    return await this.adapter.create(user);
  }

  async findById(id) {
    return await this.adapter.findById(id);
  }

  async updateById(id, update) {
    return await this.adapter.updateById(id, update);
  }

  async findOne(filter) {
    return await this.adapter.findOne(filter);
  }

  async find(filter, sort, limit, skip) {
    return await this.adapter.find(filter, sort, limit, skip);
  }

  async updateOne(filter, update) {
    return await this.adapter.updateOne(filter, update);
  }

  async deleteById(id) {
    return await this.adapter.deleteById(id);
  }

  // Add other methods as needed
}

module.exports = User;