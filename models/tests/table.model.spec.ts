import { Table } from '../table.model';

const {
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('Table', () => {
  const model = new Table();

  it('is defined', () => {
    expect(model).toBeTruthy();
  });

  ;['displayName', 'number', 'isAvailable', 'seats'].forEach(checkPropertyExists(model));
})