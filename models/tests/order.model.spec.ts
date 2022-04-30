import { CustomerOrder, OrderAddon, TableOrder } from '../order.model';

const {
  checkUniqueIndex,
  checkPropertyExists
} = require('sequelize-test-helpers');

describe('models/order/tableOrder', () => {
  const mock = new TableOrder();

  it('has properties', () => {
    ;['tableClaimId', 'status'].forEach(checkPropertyExists(mock))
  });

  it('indexes', () => {
    ;['id'].forEach(checkUniqueIndex(mock))
  });
})

describe('models/order/customerOrder', () => {
  const mock = new CustomerOrder();

  it('has properties', () => {
    ;['title', 'status', 'comment', 'price', 'totalPrice', 'dishId', 'tableOrderId', 'ownerId', 'quantity'].forEach(checkPropertyExists(mock))
  });

  it('indexes', () => {
    ;['id'].forEach(checkUniqueIndex(mock))
  });
})

describe('models/order/orderAddon', () => {
  const mock = new OrderAddon();

  it('has properties', () => {
    ;['title', 'price', 'orderId', 'addonId', 'optionId'].forEach(checkPropertyExists(mock))
  });

  it('indexes', () => {
    ;['id'].forEach(checkUniqueIndex(mock))
  });
})