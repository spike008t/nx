import { getProjects, Tree, updateJson } from '@nrwl/devkit';

/**
 * React native start command for iOS does not accept customized entry file path and use index as default
 * This update will
 * - add index.js file under project root
 * - add main under project.json and points to index.js
 * @param tree
 */
export default async function update(tree: Tree) {
  const projects = getProjects(tree);

  projects.forEach((project) => {
    if (
      project.targets?.start?.executor !== '@nrwl/react-native:start' ||
      tree.exists(`${project.root}/index.js`) ||
      tree.exists(`${project.root}/index.ts`)
    )
      return;
    tree.write(`${project.root}/index.js`, `export * from './src/main';`);
    const packageJsonPath = `${project.root}/package.json`;
    updateJson(tree, packageJsonPath, (packageJsonContent) => {
      if (!packageJsonContent.main) {
        packageJsonContent.main = 'index';
      }
      return packageJsonContent;
    });
  });
}
