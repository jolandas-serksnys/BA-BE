import { Dish } from '../dish.model';

const {
  checkUniqueIndex,
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('models/dish', () => {
  const mock = new Dish();

  it('has properties', () => {
    ;['title', 'description', 'warningLabel', 'isVisible', 'isAvailable', 'imageUrl', 'categoryId', 'basePrice'].forEach(checkPropertyExists(mock))
  });

  it('indexes', () => {
    ;['id'].forEach(checkUniqueIndex(mock))
  });
})