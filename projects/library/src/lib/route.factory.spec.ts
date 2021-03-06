import { TestBed } from '@angular/core/testing';

import { MicroFrontendComponent } from './micro-frontend.component';
import { NullComponent } from './null.component';
import { RouteFactory } from './route.factory';

describe('RouteFactory', () => {
  let factory: RouteFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({ });
    factory = TestBed.inject(RouteFactory);
  });

  it('should be created', () => {
    expect(factory).toBeTruthy();
  });

  it('should create route', () => {
    const expected = {
      children: [
        {
          component: NullComponent,
          path: '**',
        },
      ],
      component: MicroFrontendComponent,
      data: { baseUrl: 'baseUrl' },
      path: 'test',
    };
    expect(RouteFactory.createRoute('test', 'baseUrl')).toEqual(expected);
  });
});
