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

Using npm:

```sh
npm install ng-micro-frontend
```

Now you can import the `MicroFrontendModule` into your AppModule.

## Getting Started

This package only helps you setup your shell or container application that wraps your micro frontend custom elements. These custom elements can be built using Angular Elements or any other method you prefer.

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
import { MicroFrontendComponent, RouteFactory } from 'ng-micro-frontend';

const routes: Routes = [
  RouteFactory.createRoute('home', 'https://example.cdn/home'),
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

**And that's literally it! You now have your first micro frontend up and running.**

If you want to see an example application, here is the tester we use when developing this library:

https://github.com/jtneal/ng-micro-frontend/tree/main/projects/tester

For simplicity, we serve up our custom elements from the assets folder:

https://github.com/jtneal/ng-micro-frontend/tree/main/projects/tester/src/assets/examples

Then we setup our router using the MicroFrontendComponent to point to these custom elements:

https://github.com/jtneal/ng-micro-frontend/blob/main/projects/tester/src/app/app-routing.module.ts

If you need help actually creating the custom elements themselves, be on the lookout for a new version coming soon where I will thoroughly document that process as well.

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
