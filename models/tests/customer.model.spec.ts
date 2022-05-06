import { Customer } from '../customer.model';

const {
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('Customer', () => {
  const model = new Customer();

  it('is defined', () => {
    expect(model).toBeTruthy();
  });

  ['displayName'].forEach(checkPropertyExists(model));
})