describe('HeaderColorForm', () => {
  it('changes header color to dark and persists after reload', () => {
    cy.visit('/settings');

    // Wait for component to mount - use title to indicate
    cy.contains('Fargetema', { timeout: 10000 }).should('be.visible');

    // Open dropdown, see options are rendered
    cy.contains('Fargetema').click();
    cy.get('input[type="radio"]').should('have.length.greaterThan', 0);

    // Select Dark theme
    cy.contains('Dark').click();

    //Verify that the navbar color is dark
    cy.get('header').should('have.css', 'background-color', 'rgb(63, 63, 63)');

    //Check that the changes is saved after reload
    cy.reload();
    cy.contains('Fargetema', { timeout: 10000 }).should('be.visible');
    cy.get('header').should('have.css', 'background-color', 'rgb(63, 63, 63)');
  });

  it('changes header color to yellow and persists after reload', () => {
    cy.visit('/settings');

    // Wait for component to mount - use title to indicate
    cy.contains('Fargetema', { timeout: 10000 }).should('be.visible');

    // Open dropdown, see options are rendered
    cy.contains('Fargetema').click();
    cy.get('input[type="radio"]').should('have.length.greaterThan', 0);

    // Select Småspedier theme
    cy.contains('Småspeider').click();

    //Verify that the navbar color is yellow
    cy.get('header').should('have.css', 'background-color', 'rgb(255, 242, 146)');

    //Check that the changes is saved after reload
    cy.reload();
    cy.contains('Fargetema', { timeout: 10000 }).should('be.visible');
    cy.get('header').should('have.css', 'background-color', 'rgb(255, 242, 146)');
  });
});
