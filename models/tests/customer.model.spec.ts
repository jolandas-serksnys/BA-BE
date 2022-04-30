import { Customer } from '../customer.model';

const {
  checkUniqueIndex,
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('models/customer', () => {
  const mock = new Customer();

  it('has properties', () => {
    ;['displayName', 'tableClaimId'].forEach(checkPropertyExists(mock))
  });

  it('indexes', () => {
    ;['id'].forEach(checkUniqueIndex(mock))
  });
})