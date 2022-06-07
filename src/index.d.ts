/*
 *  Copyright 2022 Curity AB
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

/// <reference types="cypress" />
declare namespace Cypress {
    interface Chainable {
        /**
         * Prepares an authorization URL object based on the passed parameters
         * @param parameters AuthorizationURLParameters
         * @example
         *  cy.buildAuthorizationURL({baseURL: "...", clientID: "..."}).then(url => cy.visit(url.toString())).get('#login').should('exist')
         */
        buildAuthorizationURL(parameters: AuthorizationURLParameters): Chainable<URL>

        /**
         * Visits the Authorization URL. Either the previous subject needs to be a URL or the parameters object must be passed.
         * @example
         *   - cy.buildAuthorizationURL({baseURL: "...", clientID: "..."}).startAuthorization().get('#login').should('exist')
         *   - cy.startAuthorization({baseURL: "...", clientID: "..."}).get('#login').should('exist')
         */
        startAuthorization(parameters?: AuthorizationURLParameters): Chainable<AUTWindow>

        /**
         * Decodes a JWT and returns its claims in form of an object. If no parameter is passed then the previous subject is taken as the token.
         * @param jwt string
         * @example
         *  cy.decodeJWT(token).its('sub').should('equal', 'john.doe')
         */
        decodeJWT(jwt?: string): Chainable<Map<string, object>>

        /**
         * Gets the ID token from the fragment part of the current URL.
         * @example
         *  cy.getIDToken().should('not.be.empty')
         */
        getIDToken(): Chainable<string>

        /**
         * Gets an ID token from the fragment part of the current URL, decodes it and returns its claims.
         * @example
         *  cy.getIDTokenClaims().its('sub').should('equal', 'john.doe')
         */
        getIDTokenClaims(): Chainable<Map<string, object>>
    }

    interface AuthorizationURLParameters {
        /** The URL of the authorization endpoint. **/
        baseURL: string,
        /** The value of the `client_id` parameter. **/
        clientID: string,
        /** The value of the `response_type` parameter. Defaults to `code`. **/
        responseType?: string,
        /** The value of the `redirect_uri` parameter. **/
        redirectURI?: string,
        /** The value of the `scope` parameter. **/
        scope?: string,
        /** The value of the `state` parameter. **/
        state?: string,
        /** The value of the `prompt` parameter. Defaults to `login` in order to force login for every test (avoid SSO) **/
        prompt?: string,
        /** Any extra parameters can be added as a map in the `extraParams` fields. They will all be added to the resulting URL. **/
        extraParams?: Map<string, string>
    }
}
