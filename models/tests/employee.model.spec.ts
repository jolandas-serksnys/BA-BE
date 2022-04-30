import { Employee } from '../employee.model';

const {
  checkUniqueIndex,
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('models/employee', () => {
  const mock = new Employee();

  it('has properties', () => {
    ;['firstName', 'lastName', 'email', 'role'].forEach(checkPropertyExists(mock))
  });

  it('indexes', () => {
    ;['id'].forEach(checkUniqueIndex(mock))
  });
})