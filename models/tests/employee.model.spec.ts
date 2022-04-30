import { Employee } from '../employee.model';

const {
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('Employee', () => {
  const model = new Employee();

  it('is defined', () => {
    expect(model).toBeTruthy();
  });

  ;['firstName', 'lastName', 'email', 'role'].forEach(checkPropertyExists(model));
})