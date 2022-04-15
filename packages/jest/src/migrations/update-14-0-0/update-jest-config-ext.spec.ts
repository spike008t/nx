import { addProjectConfiguration, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { updateJestConfigExt } from './update-jest-config-ext';

describe('Jest Migration (v14.0.0)', () => {
  let tree: Tree;
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    tree.write(
      'jest.config.js',
      String.raw`
const { getJestProjects } = require('@nrwl/jest');
module.exports = {
  projects: getJestProjects(),
};
`
    );

    tree.write(
      'jest.preset.js',
      String.raw`
const nxPreset = require('@nrwl/jest/preset');
module.exports = { ...nxPreset };
`
    );
    addProjectConfiguration(tree, 'lib-one', {
      root: 'libs/lib-one',
      sourceRoot: 'libs/lib-one/src',
      targets: {
        test: {
          executor: '@nrwl/jest:jest',
          options: {
            jestConfig: 'libs/lib-one/jest.config.js',
            passWithNoTests: true,
          },
        },
      },
    });
    tree.write(
      'libs/lib-one/jest.config.js',
      String.raw`module.exports = {
        preset: '../../jest.preset.js',
        transform: {
        '^.+\\\\.[tj]sx?$': 'babel-jest',
        }
  }`
    );

    addProjectConfiguration(tree, 'lib-two', {
      root: 'libs/lib-two',
      sourceRoot: 'libs/lib-two/src',
      targets: {
        test: {
          executor: '@nrwl/jest:jest',
          options: {
            jestConfig: 'libs/lib-two/jest.config.ts',
            passWithNoTests: true,
          },
        },
      },
    });

    tree.write(
      'libs/lib-two/jest.config.ts',
      String.raw`module.exports = {
        preset: '../../jest.preset.ts',
        transform: {
        '^.+\\\\.[tj]sx?$': 'babel-jest',
        }
  }`
    );

    addProjectConfiguration(tree, 'lib-three', {
      root: 'libs/lib-three',
      sourceRoot: 'libs/lib-three/src',
      targets: {
        test: {
          executor: '@nrwl/jest:jest',
          options: {
            jestConfig: 'libs/lib-three/jest.config.ts',
            passWithNoTests: true,
          },
        },
      },
    });
  });

  it('should rename project jest.config.js to jest.config.ts', async () => {
    await updateJestConfigExt(tree);
    expect(tree.exists('libs/lib-one/jest.config.ts')).toBeTruthy();
    expect(tree.read('libs/lib-one/jest.config.ts', 'utf-8')).toMatchSnapshot();
  });

  it('should rename root jest files', async () => {
    await updateJestConfigExt(tree);
    expect(tree.exists('jest.config.ts')).toBeTruthy();
    expect(tree.exists('jest.preset.ts')).toBeTruthy();
  });

  it('should only rename files that end in .js', async () => {
    expect(tree.exists('libs/lib-two/jest.config.ts')).toBeTruthy();
    await updateJestConfigExt(tree);
    expect(tree.exists('libs/lib-two/jest.config.ts')).toBeTruthy();
  });

  it('should not throw error if file does not exit', async () => {
    await updateJestConfigExt(tree);
    expect(tree.exists('libs/lib-three/jest.config.ts')).toBeFalsy();
    expect(tree.exists('libs/lib-three/jest.config.js')).toBeFalsy();
  });
});
