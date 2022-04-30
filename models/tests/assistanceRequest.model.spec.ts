import { AssistanceRequest } from '../assistanceRequest.model';

const {
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('AssistanceRequest', () => {
  const model = new AssistanceRequest();

  it('is defined', () => {
    expect(model).toBeTruthy();
  });

  ;['type', 'isHidden', 'message', 'tableClaimId'].forEach(checkPropertyExists(model));
})