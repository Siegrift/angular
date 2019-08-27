/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="trusted-types" />

import {Inject, Injectable, InjectionToken, Optional} from '@angular/core';

let _nextRequestId = 0;
export const JSONP_HOME = '__ng_jsonp__';
let _jsonpConnections: {[key: string]: any}|null = null;

function _getJsonpConnections(): {[key: string]: any} {
  const w: {[key: string]: any} = typeof window == 'object' ? window : {};
  if (_jsonpConnections === null) {
    _jsonpConnections = w[JSONP_HOME] = {};
  }
  return _jsonpConnections;
}

/**
 * Injection token for trusted type policy for this module.
 * @publicApi
 */
export const BROWSER_JSONP_POLICY =
    new InjectionToken<Pick<TrustedTypePolicy, 'createScriptURL'>>('BROWSER_JSONP_POLICY_TOKEN');

// Make sure not to evaluate this in a non-browser environment!
@Injectable()
export class BrowserJsonp {
  constructor(@Optional() @Inject(BROWSER_JSONP_POLICY) private trustedTypesPolicy?:
                  Pick<TrustedTypePolicy, 'createScriptURL'>) {}

  // Construct a <script> element with the specified URL
  build(url: string): any {
    const node = document.createElement('script');
    // TS doesn't support trusted types yet (https://github.com/microsoft/TypeScript/issues/30024).
    node.src = this.trustedTypesPolicy ?
        this.trustedTypesPolicy.createScriptURL(url) as unknown as string :
        url;
    return node;
  }

  nextRequestID(): string { return `__req${_nextRequestId++}`; }

  requestCallback(id: string): string { return `${JSONP_HOME}.${id}.finished`; }

  exposeConnection(id: string, connection: any) {
    const connections = _getJsonpConnections();
    connections[id] = connection;
  }

  removeConnection(id: string) {
    const connections = _getJsonpConnections();
    connections[id] = null;
  }

  // Attach the <script> element to the DOM
  send(node: any) { document.body.appendChild(<Node>(node)); }

  // Remove <script> element from the DOM
  cleanup(node: any) {
    if (node.parentNode) {
      node.parentNode.removeChild(<Node>(node));
    }
  }
}
