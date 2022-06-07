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

/// <reference types="Cypress" />


const buildAuthorizationURLCommand = (parameters) => {
    const authorizationURL = new URL(parameters.baseURL)
    const params = authorizationURL.searchParams

    params.append('client_id', parameters.clientID)
    params.append('response_type', parameters.responseType ? parameters.responseType : 'code')
    params.append('prompt', parameters.prompt ? parameters.prompt : 'login')

    if (parameters.redirectURI) {
        params.append('redirect_uri', parameters.redirectURI)
    }

    if (parameters.scope) {
        params.append('scope', parameters.scope)
    }

    if (parameters.state) {
        params.append('state', parameters.state)
    }

    if (parameters.extraParams) {
        for (const parameter in parameters.extraParams) {
            params.append(parameter, parameters.extraParams[parameter])
        }
    }

    return authorizationURL
}

const createStartAuthorizationCommand = (commandPrefix) => {
    const buildAuthorizationURLCommandName = getCommandName(commandPrefix, 'buildAuthorizationURL')
    const startAuthorizationCommandName = getCommandName(commandPrefix, 'startAuthorization')

    return (subject, parameters) => {
        if (subject && subject instanceof URL) {
            cy.visit(subject.toString())
        } else {
            cy[buildAuthorizationURLCommandName](parameters)[startAuthorizationCommandName]()
        }
    }
}

const decodeJWTCommand = (subject, jwt) => {
    const token = (subject !== undefined && typeof subject === 'string') ? subject : jwt
    return JSON.parse(decodeJWT(token))
}

const getIDTokenCommand = () => {
    console.trace()
    cy.hash()
        .should('contain', '#')
        .should('contain', 'id_token')
        .then(url => {
            const fragment = url.split('#')[1]
            let idToken = null

            for (const parameter of fragment.split('&')) {
                if (parameter.startsWith('id_token')) {
                    idToken = parameter.split('=')[1]
                    break
                }
            }

            expect(idToken).not.to.be.empty

            return idToken
        })
}

const createGetIDTokenClaimsCommand = (commandPrefix) => {
    const getIDTokenName = getCommandName(commandPrefix, 'getIDToken')
    const decodeJWTName = getCommandName(commandPrefix, 'decodeJWT')

    return () => {
        cy[getIDTokenName]()[decodeJWTName]()
    }
}

const decodeJWT = (token) => {
    const payload = token.split('.')[1]
    expect(payload).not.to.be.empty

    return decodeURIComponent(Array.prototype.map.call(atob(payload.replace('-', '+').replace('_', '/')), c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''))
}

const registerCurityCommands = (commandPrefix) => {
    const commands = {
        buildAuthorizationURL: { command: buildAuthorizationURLCommand },
        startAuthorization: { command: createStartAuthorizationCommand(commandPrefix), options: { prevSubject: 'optional' }},
        decodeJWT: { command: decodeJWTCommand, options: { prevSubject: 'optional' }},
        getIDToken: { command: getIDTokenCommand },
        getIDTokenClaims: { command: createGetIDTokenClaimsCommand(commandPrefix) }
    }

    for (const commandName in commands) {
        const command = commands[commandName]
        if (command.options) {
            Cypress.Commands.add(getCommandName(commandPrefix, commandName), command.options, command.command)
        } else {
            Cypress.Commands.add(getCommandName(commandPrefix, commandName), command.command)
        }
    }
}

const getCommandName = (prefix, name) => {
    if (prefix) {
        return prefix + name.charAt(0).toUpperCase() + name.slice(1)
    } else {
        return name
    }
}

export { registerCurityCommands }
