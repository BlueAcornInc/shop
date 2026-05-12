describe('Verify yotpo integration assets', () => {
  it('serves yotpo block assets', () => {
    cy.request('/blocks/yotpo/yotpo.js').its('status').should('eq', 200);
    cy.request('/blocks/yotpo/yotpo.css').its('status').should('eq', 200);
    cy.request('/blocks/yotpo-stars/yotpo-stars.js').its('status').should('eq', 200);
    cy.request('/blocks/yotpo-stars/yotpo-stars.css').its('status').should('eq', 200);
  });
});
