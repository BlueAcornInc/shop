describe('Verify theme shell renders', () => {
  it('renders homepage with header, main, and footer', () => {
    cy.visit('/');

    cy.get('header').should('be.visible');
    cy.get('main').should('be.visible');
    cy.get('footer').should('be.visible');
  });
});
