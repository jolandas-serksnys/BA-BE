import { Addon } from '../addon.model';

const {
  checkUniqueIndex,
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('models/addon', () => {
  const mock = new Addon();

  it('has properties', () => {
    ;['title', 'isOptional', 'dishId', 'isMultiple'].forEach(checkPropertyExists(mock))
  });

  it('indexes', () => {
    ;['id'].forEach(checkUniqueIndex(mock))
  });
})