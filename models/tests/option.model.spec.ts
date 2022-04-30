import { Option } from '../option.model';

const {
  checkUniqueIndex,
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('models/option', () => {
  const mock = new Option();

  it('has properties', () => {
    ;['title', 'price', 'addonId'].forEach(checkPropertyExists(mock))
  });

  it('indexes', () => {
    ;['id'].forEach(checkUniqueIndex(mock))
  });
})