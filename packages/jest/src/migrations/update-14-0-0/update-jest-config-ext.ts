import { formatFiles, offsetFromRoot, Tree } from '@nrwl/devkit';
import { join } from 'path';
import {
  removePropertyFromJestConfig,
  addPropertyToJestConfig,
} from '../../utils/config/update-config';
import { JestExecutorOptions } from '../../executors/jest/schema';
import { forEachExecutorOptions } from '@nrwl/workspace/src/utilities/executor-options-utils';

export async function updateJestConfigExt(tree: Tree) {
  if (tree.exists('jest.config.js')) {
    tree.rename('jest.config.js', 'jest.config.ts');
  }

  if (tree.exists('jest.preset.js')) {
    tree.rename('jest.preset.js', 'jest.preset.ts');
  }

  forEachExecutorOptions<JestExecutorOptions>(
    tree,
    '@nrwl/jest:jest',
    (options, projectName) => {
      if (
        !tree.exists(options.jestConfig) ||
        !options.jestConfig.endsWith('.js')
      ) {
        return;
      }
      removePropertyFromJestConfig(tree, options.jestConfig, 'preset');
      addPropertyToJestConfig(
        tree,
        options.jestConfig,
        'preset',
        join(offsetFromRoot(options.jestConfig), 'jest.preset.ts'),
        { valueAsString: false }
      );

      tree.rename(options.jestConfig, options.jestConfig.replace('.js', '.ts'));
    }
  );
  await formatFiles(tree);
}

export default updateJestConfigExt;
