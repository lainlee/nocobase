import { Database, Model } from '..';
import { mockDatabase } from './index';

describe('collection template', () => {
  let db: Database;

  beforeEach(async () => {
    db = mockDatabase();
  });

  afterEach(async () => {
    await db.close();
  });

  it('should create collection template', async () => {
    const fn = jest.fn();

    db.collectionTemplate({
      name: 'transactionable',
      hooks: {
        afterFieldCreate(field) {
          fn();
        },
      },
    });

    db.collection({
      name: 'mainData',
    });

    db.collection({
      name: 'testCollection',
      template: 'transactionable',
      field: [
        {
          name: 'testField',
          type: 'string',
        },
      ],
    });

    expect(fn).toHaveBeenCalled();
  });
});