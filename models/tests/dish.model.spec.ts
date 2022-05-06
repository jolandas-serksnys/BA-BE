import { Dish } from '../dish.model';

const {
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('Dish', () => {
  const model = new Dish();

  it('is defined', () => {
    expect(model).toBeTruthy();
  });

  ['title', 'description', 'warningLabel', 'isVisible', 'isAvailable', 'imageUrl', 'basePrice'].forEach(checkPropertyExists(model));
})