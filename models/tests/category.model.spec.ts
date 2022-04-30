import { Category } from '../category.model';

const {
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('Category', () => {
  const model = new Category();

  it('is defined', () => {
    expect(model).toBeTruthy();
  });

  ;['title', 'description', 'isVisible', 'establishmentId'].forEach(checkPropertyExists(model));
})