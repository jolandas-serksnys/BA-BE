import { Option } from '../option.model';

const {
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('Option', () => {
  const model = new Option();

  it('is defined', () => {
    expect(model).toBeTruthy();
  });

  ;['title', 'price'].forEach(checkPropertyExists(model));
})