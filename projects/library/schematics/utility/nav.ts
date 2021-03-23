import { join, normalize } from '@angular-devkit/core';
import { chain, externalSchematic, Rule, Tree } from '@angular-devkit/schematics';

import { Application } from './applications';

export function addNavToShell(applications: Application[], sourceRoot: string, project: string): Rule {
  return chain([
    externalSchematic('@schematics/angular', 'component', { name: 'micro-frontend-nav', project }),
    updateNavTemplate(applications, sourceRoot),
    addNavToAppComponent(sourceRoot),
  ]);
}

export function updateNavTemplate(applications: Application[], sourceRoot: string): Rule {
  return (host: Tree): Tree => {
    const htmlPath = join(normalize(sourceRoot), normalize('app/micro-frontend-nav/micro-frontend-nav.component.html'));
    const htmlData = `<nav>
  <ul>
    ${
      applications
        .map((a) => `<li><a routerLink="/${a.dasherized}">${a.classified}</a></li>`)
        .join('\n    ')
    }
  </ul>
</nav>
`;

    host.overwrite(htmlPath, htmlData);

    return host;
  };
}

export function addNavToAppComponent(sourceRoot: string): Rule {
  return (host: Tree): Tree => {
    const find = '<router-outlet></router-outlet>';
    const replace = '<app-micro-frontend-nav></app-micro-frontend-nav>\n<router-outlet></router-outlet>';
    const htmlPath = join(normalize(sourceRoot), normalize('app/app.component.html'));
    const htmlData = host.read(htmlPath) || find;

    host.overwrite(htmlPath, htmlData.toString().replace(find, replace));

    return host;
  };
}
