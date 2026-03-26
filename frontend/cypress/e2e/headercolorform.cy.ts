describe('HeaderColorForm', () => {
  it('renders options and allows selecting a header color', () => {
    cy.visit('/settings');

    // Wait for component to mount - use title to indicate
    cy.contains('Fargetema', { timeout: 10000 }).should('be.visible');

    // Open dropdown, see options are rendered
    cy.get('details').first().invoke('attr', 'open', true);
    cy.get('input[type="radio"]').should('have.length.greaterThan', 0);

    // Click and verify first option
    cy.get('input[type="radio"]').first().check({ force: true });
    cy.get('input[type="radio"]').first().should('be.checked');
  });
});
