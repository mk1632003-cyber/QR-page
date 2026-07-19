// cypress/e2e/home.cy.ts

describe('Home Page', () => {
  it('loads successfully', () => {
    cy.visit('http://localhost:3000')
    cy.contains('Welcome')
  })
})
