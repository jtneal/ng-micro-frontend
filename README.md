[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=jtneal_ng-micro-frontend&metric=alert_status)](https://sonarcloud.io/dashboard?id=jtneal_ng-micro-frontend)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=jtneal_ng-micro-frontend&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=jtneal_ng-micro-frontend)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=jtneal_ng-micro-frontend&metric=security_rating)](https://sonarcloud.io/dashboard?id=jtneal_ng-micro-frontend)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=jtneal_ng-micro-frontend&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=jtneal_ng-micro-frontend)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=jtneal_ng-micro-frontend&metric=coverage)](https://sonarcloud.io/dashboard?id=jtneal_ng-micro-frontend)

# Angular Micro Frontend

A library for building run-time compilation micro frontends with custom elements using Angular.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Development](#development)
- [Contributing](#contributing)
- [Support + Feedback](#support--feedback)
- [License](#license)

## Installation

You can utilize our Angular schematics to install the package and generate an automated, feature complete, micro frontend architecture using Angular Elements in mere seconds.

```sh
# Create your shell/container
ng new --routing --strict --style scss shell
cd shell

# Create your micro frontends
ng generate application --routing --style scss mfe1
ng generate application --routing --style scss mfe2
ng generate application --routing --style scss mfe3

# Add ng-micro-frontend to each project
ng add ng-micro-frontend --project mfe1 --type micro --port 4210
ng add ng-micro-frontend --project mfe2 --type micro --port 4220
ng add ng-micro-frontend --project mfe3 --type micro --port 4230
ng add ng-micro-frontend --project shell --type shell --port 4200
```

This will also generate a small micro frontend nav component and add it to your shell's AppComponent HTML. If you don't want this, you can pass in a `--minimal` flag to skip that step.

```sh
ng add ng-micro-frontend --project shell --type shell --port 4200 --minimal
```

Once the schematics have completed, you're ready to start everything up.

I recommended starting off by serving up one of your micro frontends to make sure it can run in standalone mode:

```sh
npm run start:mfe1
```

Then go to http://localhost:4210 (for example) and make sure it works.

To run your shell and all of your micro frontends at once within a mono repo, just run:

```sh
npm start
```

Now when you visit http://localhost:4200 you should see everything working together appropriately.

Also, so far, all of this assumes all of your applications are in the same repo. However, that is not a hard requirement. The automation works best in monorepos, but can certainly be adapted to having separate repos for each application. If you want to see a demo of what this project would look like after running these commands, here's a demo I have created:

https://github.com/jtneal/ng-micro-frontend-demo

## Getting Started

If you don't use our schematics, you can still install our package and manually configure your applications. This package works best if your shell and micro frontends are both written in Angular, but you could just as easily adapt your code to support micro frontends written in any framework that supports building custom elements.

Our MicroFrontendComponent will help you route to a custom element using configuration within a manifest.json file. You would serve up your scripts, styles, and manifest from the same location like so:

- https://example.cdn/home/home.scripts.js
- https://example.cdn/home/home.polyfills.js
- https://example.cdn/home/home.styles.css
- https://example.cdn/home/manifest.json

The only filename here that matters is the manifest.json, because that file will point to your other assets using this predefined contract:

```json
{
  "customElement": "example-home",
  "main.js": "home.scripts.js",
  "polyfills.js": "home.polyfills.js",
  "styles.css": "home.styles.css"
}
```

Once your custom element's manifest.json file is available, you're ready to route to it:

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteFactory } from 'ng-micro-frontend';

const routes: Routes = [
  RouteFactory.createRoute('home', 'https://example.cdn/home'),
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

If you need help creating the actual custom elements and manifest.json file, here's what you need to know:

1. You need a catch all route in each micro frontend routing module to resolve routing issues:

```typescript
// app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NullComponent } from 'ng-micro-frontend';

const routes: Routes = [{ component: NullComponent, path: '**' }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

2. You need to update your AppModule, changing the bootstrap and adding a DoBootstrap lifecycle hook that creates your custom elements:

```typescript
// app.module.ts

import { NgModule, DoBootstrap, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { BrowserModule } from '@angular/platform-browser';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: environment.production ? [] : [AppComponent]
})
export class AppModule implements DoBootstrap {
  public constructor(private readonly injector: Injector) { }

  public ngDoBootstrap(): void {
    const customElement = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('custom-mfe1', customElement);
  }
}
```

3. You need to update your AppComponent to perform initial navigation for the micro frontend:

```typescript
// app.component.ts

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public constructor(
    private readonly location: Location,
    private readonly router: Router
  ) { }

  public ngOnInit(): void {
    if (environment.production) {
      this.router.initialNavigation();
      this.router.navigate([this.location.path()]);
    }
  }
}
```

4. You'll need a custom webpack config to create the manifest file:

```javascript
// webpack.config.js

const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

module.exports = {
  plugins: [
    new WebpackManifestPlugin({
      filter: (file) => file.name.endsWith('.js') || file.name.endsWith('.css'),
      seed: { customElement: 'custom-mfe1' },
    }),
  ],
};
```

5. In order to use this config, you'll need to add ngx-build-plus to your project and install dependencies:

```sh
ng add ngx-build-plus --project mfe1
npm install --save-dev webpack-manifest-plugin
```

6. Lastly, you'll need to reference this in your angular.json file in multiple locations:

```json
{
  "projects": {
    "mfe1": {
      "architect": {
        "build": {
          "options": {
            "extraWebpackConfig": "projects/mfe1/webpack.config.js"
          }
        },
        "serve": {
          "options": {
            "extraWebpackConfig": "projects/mfe1/webpack.config.js"
          }
        },
        "test": {
          "options": {
            "extraWebpackConfig": "projects/mfe1/webpack.config.js"
          }
        }
      }
    }
  }
}
```

7. Keep in mind, all of this is done for you automatically if you use our schematics, like so:

```sh
ng add ng-micro-frontend --project mfe1
```

## Development

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

If you want to use a headless browser, and generate coverage, use `npm run test:cov` instead.

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

If you want to use a headless browser, use `npm run e2e:ci` instead.

### Running the tester app

The workspace includes a tester application that can be used to test out features of the SDK. Run this using `ng serve tester` and browse to http://localhost:4200.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Contributing

We appreciate feedback and contribution to this repo! Feel free to submit a pull request and we will work with you to get it reviewed and merged.

## Support + Feedback

For support or to provide feedback, please [raise an issue on our issue tracker](https://github.com/jtneal/ng-micro-frontend/issues).

## License

This project is licensed under the MIT license. See the [LICENSE](https://github.com/jtneal/ng-micro-frontend/blob/main/LICENSE) file for more info.
