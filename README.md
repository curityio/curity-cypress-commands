# Curity Cypress Commands

Cypress commands used when testing the Curity Identity Server plugins.

## Installation

Install using npm, with

```shell
npm install -D @curity/cypress-commands
```

## Usage

To use the commands in your tests:

1. Import the registration function in your spec file with `import { registerCurityCommands } from '@curity/cypress-commands`.
2. Register commands once before running any tests by calling `registerCurityCommands()`.
3. You can then use the commands as any other Cypress command, e.g. `cy.getIDToken()`.

You can see the spec files in `cypress/integration` to check how the commands are used in Cypress tests. 

### Registering with a Prefix

If you happen to use other custom Cypress commands with the same names, then you can register the Curity commands with a prefix.
E.g. `registerCurityCommands('curity')`. All command names from this package will be prefixed with the chosen string and the
first letter of the original command name will be capitalized. E.g. `getIDToken` will become `curityGetIDToken`.

Note that you will not get Typescript support if you register commands with a prefix.

## Available commands

- [buildAuthorizationURL](#buildauthorizationurl)
- [startAuthorization](#startauthorization)
- [decodeJWT](#decodejwt)
- [getIDToken](#getidtoken)
- [getIDTokenClaims](#getidtokenclaims)

### buildAuthorizationURL

Prepares an authorization URL object based on the passed parameters. See `src/index.d.ts` for the list of currently supported parameters.

Example usage

```javascript
    cy.buildAuthorizationURL({baseURL: "https://idsvr.example.com", clientID: "client1"})
        .then(url => cy.visit(url.toString())).get('#login').should('exist')
```

### startAuthorization

Visits the Authorization URL. Either the previous subject needs to be a URL or the parameters object must be passed.
See `src/index.d.ts` for the list of currently supported parameters.

Example usage

```javascript
    const parameters = { baseURL: "https://idsvr.example.com", clientID: "client1" }
    cy.buildAuthorizationURL(parameters).startAuthorization().get('#login').should('exist')
    cy.startAuthorization(parameters).get('#login').should('exist')
```

### decodeJWT         

Decodes a JWT and returns its claims in form of a map. If no parameter is passed then the previous subject is taken as the token.

Example usage

```javascript
    cy.decodeJWT(token).its('sub').should('equal', 'john.doe')
```

### getIDToken

Gets the ID token from the fragment part of the current URL.

Example usage

```javascript
    cy.getIDToken().should('not.be.empty')
```

### getIDTokenClaims

Gets the ID token from the fragment part of the current URL, decodes it and returns its claims. It's a shorthand for calling
`getIDToken` and `decodeJWT` in a chain.

Example usage

```javascript
    cy.getIDTokenClaims().its('sub').should('equal', 'john.doe')
```
