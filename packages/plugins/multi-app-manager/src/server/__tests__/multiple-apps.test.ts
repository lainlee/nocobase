import { Database } from '@nocobase/database';
import { mockServer, MockServer } from '@nocobase/test';
import { uid } from '@nocobase/utils';
import { PluginMultiAppManager } from '../server';

describe('multiple apps create', () => {
  let app: MockServer;
  let db: Database;

  beforeEach(async () => {
    app = mockServer({});
    db = app.db;
    await app.cleanDb();
    app.plugin(PluginMultiAppManager);

    await app.loadAndInstall();
  });

  afterEach(async () => {
    await app.destroy();
  });

  it('should register db creator', async () => {
    const fn = jest.fn();

    const appPlugin = app.getPlugin<PluginMultiAppManager>('PluginMultiAppManager');
    const defaultDbCreator = appPlugin.appDbCreator;

    appPlugin.setAppDbCreator(async (app) => {
      fn();
      await defaultDbCreator(app);
    });

    const name = `td_${uid()}`;
    await db.getRepository('applications').create({
      values: {
        name,
        options: {
          plugins: [],
        },
      },
    });
    await app.appManager.removeApplication(name);

    expect(fn).toBeCalled();
  });

  it('should create application', async () => {
    const name = `td_${uid()}`;
    const miniApp = await db.getRepository('applications').create({
      values: {
        name,
        options: {
          plugins: [],
        },
      },
    });

    expect(app.appManager.applications.get(name)).toBeDefined();
  });

  it('should remove application', async () => {
    const name = `td_${uid()}`;
    await db.getRepository('applications').create({
      values: {
        name,
        options: {
          plugins: [],
        },
      },
    });

    expect(app.appManager.applications.get(name)).toBeDefined();

    await db.getRepository('applications').destroy({
      filter: {
        name,
      },
    });

    expect(app.appManager.applications.get(name)).toBeUndefined();
  });

  it('should create with plugins', async () => {
    const name = `td_${uid()}`;
    await db.getRepository('applications').create({
      values: {
        name,
        options: {
          plugins: [['ui-schema-storage', { test: 'B' }]],
        },
      },
    });

    const miniApp = app.appManager.applications.get(name);
    expect(miniApp).toBeDefined();

    const plugin = miniApp.pm.get('ui-schema-storage');

    expect(plugin).toBeDefined();
    expect(plugin.options).toMatchObject({
      test: 'B',
    });
  });

  it('should lazy load applications', async () => {
    const name = `td_${uid()}`;
    await db.getRepository('applications').create({
      values: {
        name,
        options: {
          plugins: ['ui-schema-storage'],
        },
      },
    });

    await app.appManager.removeApplication(name);

    app.appManager.setAppSelector(() => {
      return name;
    });

    expect(app.appManager.applications.has(name)).toBeFalsy();

    await app.agent().resource('test').test();

    expect(app.appManager.applications.has(name)).toBeTruthy();
  });

  it('should upgrade sub apps when main app upgrade', async () => {
    const subAppName = `t_${uid()}`;

    await app.db.getRepository('applications').create({
      values: {
        name: subAppName,
        options: {
          plugins: [],
        },
      },
    });

    const subApp = await app.appManager.getApplication(subAppName);
    const jestFn = jest.fn();

    subApp.on('afterUpgrade', () => {
      jestFn();
    });

    await app.upgrade();

    expect(jestFn).toBeCalled();
  });
});
