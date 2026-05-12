describe('Verify store-locator integration assets', () => {
  it('serves store-locator and product-availability assets', () => {
    cy.request('/blocks/store-locator/store-locator.js').its('status').should('eq', 200);
    cy.request('/blocks/store-locator/store-locator.css').its('status').should('eq', 200);
    cy.request('/blocks/product-availability/product-availability.js').its('status').should('eq', 200);
    cy.request('/blocks/product-availability/product-availability.css').its('status').should('eq', 200);
  });
});
