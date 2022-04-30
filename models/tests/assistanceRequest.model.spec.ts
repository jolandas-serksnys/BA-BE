import { AssistanceRequest } from '../assistanceRequest.model';

const {
  checkUniqueIndex,
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('models/assistanceRequest', () => {
  const mock = new AssistanceRequest();

  it('has properties', () => {
    ;['type', 'isHidden', 'message', 'tableClaimId'].forEach(checkPropertyExists(mock))
  });

  it('indexes', () => {
    ;['id'].forEach(checkUniqueIndex(mock))
  });
})