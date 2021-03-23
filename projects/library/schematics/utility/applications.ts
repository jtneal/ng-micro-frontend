import { strings, workspaces } from '@angular-devkit/core';
import { ProjectType } from '@schematics/angular/utility/workspace-models';

export interface Application {
  accessor?: string;
  classified: string;
  dasherized: string;
  name: string;
  port: number;
  property?: string;
}

export function getSupportedApplications(workspace: workspaces.WorkspaceDefinition, project: string): Application[] {
  const applications = [];

  for (const [p, config] of workspace.projects) {
    if (p === project || config.extensions.projectType !== ProjectType.Application) {
      continue;
    }

    const application: Application = {
      classified: strings.classify(p),
      dasherized: strings.dasherize(p),
      name: p,
      port: config.targets.get('serve')?.options?.port as number ?? 4200,
    };

    if (application.dasherized.includes('-')) {
      application.accessor = `microFrontends['${application.dasherized}']`;
      application.property = `'${application.dasherized}'`;
    } else {
      application.accessor = `microFrontends.${application.dasherized}`;
      application.property = application.dasherized;
    }

    applications.push(application);
  }

  return applications;
}
