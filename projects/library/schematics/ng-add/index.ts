import { chain, externalSchematic, noop, Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/workspace';
import { ProjectType } from '@schematics/angular/utility/workspace-models';

import { getSupportedApplications } from '../utility/applications';
import { chainIf } from '../utility/chain';
import { addMicroWebpackConfig, updateAngularConfig, updateMicroAngularConfig } from '../utility/config';
import { addDependencies, addMicroDependencies } from '../utility/dependencies';
import { setupCustomElement, setupShell } from '../utility/micro-frontend';
import { addNavToShell } from '../utility/nav';
import { addInitialNavigation, addRouteToMicroFrontend, addRoutesToShell } from '../utility/routes';
import { Schema } from './schema';

export function ngAdd(options: Schema): Rule {
  return async (host: Tree): Promise<Rule> => {
    const workspace = await getWorkspace(host);

    if (!options.project) {
      options.project = workspace.extensions.defaultProject as string;
    }

    if (!options.project) {
      throw new SchematicsException('No default project found. Please specifiy a project name!');
    }

    const project = options.project;
    const config = workspace.projects.get(project);

    if (!config) {
      throw new SchematicsException(`Project ${project} not found!`);
    }

    if (config.extensions.projectType !== ProjectType.Application) {
      throw new SchematicsException(`Only projects of type "${ProjectType.Application}" are supported!`);
    }

    const applications = getSupportedApplications(workspace, project);
    const isShell = options.type === 'shell';
    const port = parseInt(options.port, 10);
    const sourceRoot = config.sourceRoot as string;

    return chain([
      updateAngularConfig(config, port),
      // This has to go earlier so we can update the workspace before running external schematics
      !isShell ? updateMicroAngularConfig(config) : noop(),
      updateWorkspace(workspace),
      addDependencies(project),
      externalSchematic('@angular/elements', 'ng-add', { project }),
      externalSchematic('ngx-build-plus', 'ng-add', { project }),
      chainIf(isShell, [
        setupShell(sourceRoot),
        chainIf(!options.minimal, [addNavToShell(applications, sourceRoot, project)]),
        addRoutesToShell(applications, sourceRoot),
      ]),
      chainIf(!isShell, [
        addMicroWebpackConfig(config.root, project),
        setupCustomElement(sourceRoot, project),
        addMicroDependencies(project),
        addRouteToMicroFrontend(sourceRoot, project),
        addInitialNavigation(sourceRoot),
      ]),
    ]);
  };
}
