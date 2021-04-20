import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Manifest } from './manifest';

@Injectable({ providedIn: 'root' })
export class MicroFrontendService {
  private readonly loaded: { [key: string]: Manifest } = { };

  public constructor(
    @Inject(DOCUMENT) private readonly document: any,
    private readonly http: HttpClient,
  ) { }

  public createCustomElement(baseUrl: string, target: HTMLElement): Observable<Manifest> {
    if (this.loaded.hasOwnProperty(baseUrl)) {
      const manifest = this.loaded[baseUrl];

      if (!this.customElementExists(manifest)) {
        this.loadCustomElement(manifest, target);
      }

      return of(manifest);
    }

    return this.getManifest(baseUrl).pipe(
      tap((manifest) => {
        if (!this.customElementExists(manifest)) {
          this.loadStyle(`${baseUrl}/${manifest['styles.css']}`);
          this.loadScript(`${baseUrl}/${manifest['polyfills.js']}`);
          this.loadScript(`${baseUrl}/${manifest['main.js']}`);
          this.loadCustomElement(manifest, target);
        }

        this.loaded[baseUrl] = manifest;
      }),
    );
  }

  private customElementExists(manifest: Manifest): boolean {
    return !!customElements.get(manifest.customElement);
  }

  private getManifest(baseUrl: string): Observable<Manifest> {
    return this.http.get<Manifest>(`${baseUrl}/manifest.json`);
  }

  private loadStyle(href: string): void {
    const style = this.document.createElement('link');
    style.rel = 'stylesheet';
    style.href = href;
    document.head.appendChild(style);
  }

  private loadScript(src: string): void {
    const script = this.document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
  }

  private loadCustomElement(manifest: Manifest, target: HTMLElement): void {
    target.appendChild(this.document.createElement(manifest.customElement));
  }
}
