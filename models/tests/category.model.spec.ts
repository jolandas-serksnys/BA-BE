import { Category } from '../category.model';

const {
  checkUniqueIndex,
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('models/category', () => {
  const mock = new Category();

  it('has properties', () => {
    ;['title', 'description', 'isVisible', 'establishmentId'].forEach(checkPropertyExists(mock))
  });

  it('indexes', () => {
    ;['id'].forEach(checkUniqueIndex(mock))
  });
})