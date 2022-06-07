/*
 * Copyright 2022 Curity AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/// <reference path="../../src/index.d.ts" />


import { registerCurityCommands } from "../../src";

describe('Curity Cypress commands tests', () => {
  const idToken = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJqb2huLmRvZSIsImlzcyI6Imh0dHBzOi8vaWRzdnIuZXhhbXBsZS5jb20iLCJhdWQiOiJ0ZXN0LWNsaWVudCJ9.VaG1QyN_etsHSFayUspDJ8wxPCEAr3bLz6hNExA87KcMurAbOWmmsIc8lTFxBNitPV7gov-aHf85vTiPUbefY8uQRF0BdNKFamCpznWQRbdi06xmyr5Pc6GUftarfZYackklU6W27qNWG6An05faLpJV887Hp4WDONQSFOr3_3UB9lU3XNR3mFKdteqccHTm4hc_9JDsExeEZNN52izOKhYJFc_ZKYr52b16KLsJ4qYrnCOzEWRmYRr1iKIxRWjHa_lc4pPYeg3958CewBaz_8Y1QPSXgpPga8o4gGt4MEs_NL6kqkjGv24SBSxpFtR8h4JsiTncL4YPiQNj2isQT_XDTC92DCJo_b4Y5QUxAgxsvEualBQ7zZ0iqvUrjyl9c2udd-QsI9IyuOW5l2jhVBo9eI4qsyqo2B_7mU8PNzgOTFw-0n_qA5zrF2OHNqUXKPNGgk5JSG-AOUfex3E9eMcTaHAjhy1kWeanWF-9BBcTsgp9UMIShzBvnx39JigO_iS-azYaR-jXccEsTHb56EATwTFBKBpSq9HnUSEZoEDMpnME2k_7ANohgxJFIAOsEiaf9RDwV7HMwZxEVgxbt9FOirhDc1vATSmGzq0ia5zSnftTTFWAwoCuQekRf7HsroGvCO8dO-Ad6HT1KKIZQDpg_1IXe8BoCkNGs_GXLtk'

  registerCurityCommands()

  it('Default parameters are added to the authorization URL', () => {

    cy.buildAuthorizationURL({
      baseURL: 'https://idsvr.example.com/authorize',
      clientID: 'test-client'
    })
    .then(url => {
      expect(url.toString())
          .to.match(new RegExp('^https://idsvr\\.example\\.com/authorize\\?'))
          .and
          .contains('response_type=code')
          .and
          .contains('prompt=login')
    })
  })

  it('All passed parameters are added to the authorization URL', () => {

    cy.buildAuthorizationURL({
      baseURL: 'https://idsvr.example.com/authorize',
      clientID: 'test-client',
      responseType: 'code id_token',
      redirectURI: 'http://localhost/cb',
      state: 'abc',
      prompt: 'none',
      extraParams: new Map([
        ['code_challenge', '1234'],
        ['code_challenge_method', 'plain']
  ])
    })
        .then(url => {
          expect(url.toString())
              .to.match(new RegExp('^https://idsvr\\.example\\.com/authorize\\?'))
              .and.contain('response_type=code+id_token')
              .and.contain('prompt=none')
              .and.contain('client_id=test-client')
              .and.contain('redirect_uri=http%3A%2F%2Flocalhost%2Fcb')
              .and.contain('state=abc')
              .and.contain('code_challenge=1234')
              .and.contain('code_challenge_method=plain')
        })
  })

  it('Should start authorization when parameters are passed', () => {
    const parameters = { baseURL: "https://idsvr.example.com/authorize", clientID: "test-client" }
    let requestCounter = 0

    cy.intercept(
        { url: /^https:\/\/idsvr\.example\.com\/authorize/ },
        (req) => {
          requestCounter += 1
          req.reply({
            statusCode: 200,
            body: '',
            headers: {
              'content-type': 'text/html'
            }
          })
    }).as('authorize')

    cy.startAuthorization(parameters)

    cy.wait('@authorize').then(() => {
      expect(requestCounter).to.equal(1)
    })
  })

  it('Should start authorization when no parameters passed but call chained with a URL subject', () => {
    const parameters = { baseURL: "https://idsvr.example.com/authorize", clientID: "test-client" }
    let requestCounter = 0

    cy.intercept(
        { url: /^https:\/\/idsvr\.example\.com\/authorize/ },
        (req) => {
          requestCounter += 1
          req.reply({
            statusCode: 200,
            body: '',
            headers: {
              'content-type': 'text/html'
            }
          })
        }).as('authorize')

    cy.buildAuthorizationURL(parameters).startAuthorization()

    cy.wait('@authorize').then(() => {
      expect(requestCounter).to.equal(1)
    })
  })

  it('Should decode a JWT', () => {
    cy.decodeJWT(idToken).then(claims => {
      expect(claims.sub).to.exist.and.equal('john.doe')
      expect(claims.aud).to.exist.and.equal('test-client')
    })
  })

  it('Should read an ID token from fragment part of current URL', () => {
    cy.visit('cypress/index.html#id_token=abcdef').getIDToken().should('equal', 'abcdef')
  })

  it('Should decode an ID token from fragment part of URL', () => {
    cy.visit(`cypress/index.html#id_token=${idToken}`).getIDTokenClaims().its('sub').should('equal', 'john.doe')
  })

  it('Should decode an ID token from fragment part of URL with custom commands prefix', () => {
    registerCurityCommands("custom")
    cy.visit(`cypress/index.html#id_token=${idToken}`).customGetIDTokenClaims().its('sub').should('equal', 'john.doe')
  })
})
