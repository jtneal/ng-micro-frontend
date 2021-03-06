import { Injectable } from '@angular/core';
import { Route } from '@angular/router';

import { MicroFrontendComponent } from './micro-frontend.component';
import { NullComponent } from './null.component';

@Injectable({ providedIn: 'root' })
export class RouteFactory {
  public static createRoute(path: string, baseUrl: string): Route {
    return {
      children: [
        {
          component: NullComponent,
          path: '**',
        },
      ],
      component: MicroFrontendComponent,
      data: { baseUrl },
      path,
    };
  }
}
