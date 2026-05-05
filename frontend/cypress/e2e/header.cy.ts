describe('Header', () => {
  it('navigates to homepage when clicking logo', () => {
    // Go to a different page first
    cy.visit('/settings');

    // Wait until the page is loaded
    cy.contains('Fargetema', { timeout: 10000 }).should('be.visible');

    // Click on the header (logo or text)
    cy.get('header').within(() => {
      cy.get('a[aria-label="Go to homepage"]').click();
    });

    // Verify that we are on the homepage
    cy.url({ timeout: 7000 }).should('eq', Cypress.config().baseUrl + '/');
  });
});
