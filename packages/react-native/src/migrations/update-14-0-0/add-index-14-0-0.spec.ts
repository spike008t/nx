import { addProjectConfiguration, readJson, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import update from './add-index-14-0-0';

describe('Add index to react native project root', () => {
  let tree: Tree;

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, 'products', {
      root: 'apps/products',
      sourceRoot: 'apps/products/src',
      targets: {
        start: {
          executor: '@nrwl/react-native:start',
          options: {
            port: 8081,
          },
        },
      },
    });
  });

  it(`should add index.js at project root and update package.json`, async () => {
    tree.write(
      'apps/products/package.json',
      JSON.stringify({
        dependencies: {},
      })
    );
    await update(tree);

    expect(tree.exists('apps/products/index.js')).toEqual(true);
    expect(tree.read('apps/products/index.js', 'utf-8')).toEqual(
      `export * from './src/main';`
    );
    const packageJson = readJson(tree, 'apps/products/package.json');
    expect(packageJson).toEqual({
      main: 'index',
      dependencies: {},
    });
  });

  it(`should not update index.js and package.json at project root `, async () => {
    tree.write(
      'apps/products/package.json',
      JSON.stringify({
        main: 'main',
        dependencies: {},
      })
    );
    tree.write('apps/products/index.js', '');
    await update(tree);

    expect(tree.exists('apps/products/index.js')).toEqual(true);
    expect(tree.read('apps/products/index.js', 'utf-8')).toEqual('');
    const packageJson = readJson(tree, 'apps/products/package.json');
    expect(packageJson).toEqual({
      main: 'main',
      dependencies: {},
    });
  });
});
