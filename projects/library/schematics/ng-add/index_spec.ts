import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions, Style } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';

import { Schema } from './schema';

describe('Ng Add Schematic', () => {
  const schematicRunner = new SchematicTestRunner('schematics', require.resolve('../collection.json'));
  const defaultOptions: Schema = {
    project: 'bar',
    port: '4200',
    type: 'shell',
    minimal: false,
  };
  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '6.0.0',
  };
  const appOptions: ApplicationOptions = {
    name: 'bar',
    inlineStyle: false,
    inlineTemplate: false,
    routing: true,
    style: Style.Css,
    skipTests: false,
    skipPackageJson: false,
  };
  let appTree: UnitTestTree;

  beforeEach(async () => {
    appTree = await schematicRunner.runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions).toPromise();
    appTree = await schematicRunner.runExternalSchematicAsync('@schematics/angular', 'application', appOptions, appTree).toPromise();
  });

  it('should setup shell', async () => {
    const options = { ...defaultOptions };
    const tree = await schematicRunner.runSchematicAsync('ng-add', options, appTree).toPromise();

    expect(tree.files).toContain('/projects/bar/src/app/micro-frontend-nav/micro-frontend-nav.component.css');
    expect(tree.files).toContain('/projects/bar/src/app/micro-frontend-nav/micro-frontend-nav.component.html');
    expect(tree.files).toContain('/projects/bar/src/app/micro-frontend-nav/micro-frontend-nav.component.spec.ts');
    expect(tree.files).toContain('/projects/bar/src/app/micro-frontend-nav/micro-frontend-nav.component.ts');
  });

  it('should setup shell minimal', async () => {
    const options = { ...defaultOptions, minimal: true };
    const tree = await schematicRunner.runSchematicAsync('ng-add', options, appTree).toPromise();

    expect(tree.files).not.toContain('/projects/bar/src/app/micro-frontend-nav/micro-frontend-nav.component.css');
    expect(tree.files).not.toContain('/projects/bar/src/app/micro-frontend-nav/micro-frontend-nav.component.html');
    expect(tree.files).not.toContain('/projects/bar/src/app/micro-frontend-nav/micro-frontend-nav.component.spec.ts');
    expect(tree.files).not.toContain('/projects/bar/src/app/micro-frontend-nav/micro-frontend-nav.component.ts');
  });

  it('should setup micro', async () => {
    const options = { ...defaultOptions, type: 'micro' };
    const tree = await schematicRunner.runSchematicAsync('ng-add', options, appTree).toPromise();

    expect(tree.files).toContain('/projects/bar/webpack.config.js');
    expect(tree.files).toContain('/projects/bar/webpack.prod.config.js');
  });
});
