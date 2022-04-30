import { Establishment } from '../establishment.model';

const {
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('Establishment', () => {
  const model = new Establishment();

  it('is defined', () => {
    expect(model).toBeTruthy();
  });

  ;['title', 'description'].forEach(checkPropertyExists(model));
})