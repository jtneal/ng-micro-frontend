import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { min } from 'rxjs/operators';

import { MicroFrontendService } from './micro-frontend.service';

describe('MicroFrontendService', () => {
  const mock = {
    customElement: 'customElement',
    'main.js': 'main.js',
    'polyfills.js': 'polyfills.js',
    'styles.css': 'styles.css',
  };
  const minimalMock = {
    customElement: 'customElement',
    'main.js': 'main.js',
  };
  let http: HttpClient;
  let httpTestingController: HttpTestingController;
  let service: MicroFrontendService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(MicroFrontendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create custom element using http', () => {
    service.createCustomElement('baseUrl', document.createElement('div')).subscribe((manifest) => expect(manifest).toEqual(mock));
    const req = httpTestingController.expectOne('baseUrl/manifest.json');
    expect(req.request.method).toEqual('GET');
    req.flush(mock);
    httpTestingController.verify();
  });

  it('should create custom element with minimal manifest using http', () => {
    service.createCustomElement('baseUrl', document.createElement('div')).subscribe((manifest) => expect(manifest).toEqual(minimalMock));
    const req = httpTestingController.expectOne('baseUrl/manifest.json');
    expect(req.request.method).toEqual('GET');
    req.flush(minimalMock);
    httpTestingController.verify();
  });

  it('should not create custom element using http when it already exists', () => {
    spyOn(customElements, 'get').and.returnValue(true);
    service.createCustomElement('baseUrl', document.createElement('div')).subscribe((manifest) => expect(manifest).toEqual(mock));
    const req = httpTestingController.expectOne('baseUrl/manifest.json');
    expect(req.request.method).toEqual('GET');
    req.flush(mock);
    httpTestingController.verify();
  });

  it('should create custom element using cache', async () => {
    spyOn(http, 'get').and.returnValue(of(mock));
    const fromHttp = await service.createCustomElement('baseUrl', document.createElement('div')).toPromise();
    const fromCache = await service.createCustomElement('baseUrl', document.createElement('div')).toPromise();
    expect(fromHttp).toEqual(mock);
    expect(fromCache).toEqual(mock);
  });
});
