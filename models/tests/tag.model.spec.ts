import { Table } from '../table.model';
import { Tag } from '../tag.model';

const {
  checkUniqueIndex,
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('models/tag', () => {
  const mock = new Tag();

  it('has properties', () => {
    ;['title'].forEach(checkPropertyExists(mock))
  });

  it('indexes', () => {
    ;['id'].forEach(checkUniqueIndex(mock))
  });
})