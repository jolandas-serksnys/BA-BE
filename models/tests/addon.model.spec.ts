import { Addon } from '../addon.model';

const {
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('Addon', () => {
  const model = new Addon();

  it('is defined', () => {
    expect(model).toBeTruthy();
  });

  ['title', 'isOptional', 'dishId', 'isMultiple'].forEach(checkPropertyExists(model));
});