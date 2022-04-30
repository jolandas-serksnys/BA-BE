import { Table } from '../table.model';

const {
  checkUniqueIndex,
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('models/table', () => {
  const mock = new Table();

  it('has properties', () => {
    ;['displayName', 'number', 'isAvailable', 'seats'].forEach(checkPropertyExists(mock))
  });

  it('indexes', () => {
    ;['id'].forEach(checkUniqueIndex(mock))
  });
})