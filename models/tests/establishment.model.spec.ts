import { Establishment } from '../establishment.model';

const {
  checkUniqueIndex,
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('models/establishment', () => {
  const mock = new Establishment();

  it('has properties', () => {
    ;['title', 'description'].forEach(checkPropertyExists(mock))
  });

  it('indexes', () => {
    ;['id'].forEach(checkUniqueIndex(mock))
  });
})