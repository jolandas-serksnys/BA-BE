import { Tag } from '../tag.model';

const {
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('Tag', () => {
  const model = new Tag();

  it('is defined', () => {
    expect(model).toBeTruthy();
  });

  ['title'].forEach(checkPropertyExists(model))
})