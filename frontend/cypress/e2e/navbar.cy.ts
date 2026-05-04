describe('Navbar', () => {
  beforeEach(() => {
    // Mock API call
    cy.intercept('GET', '**/rest/v1/song_suggestions*', {
      statusCode: 200,
      body: [],
    });

    // Visit homepage before each test
    cy.visit('/');
  });

  // Verify that all navigation labels are visible
  it('renders all navbar links', () => {
    cy.contains('Hjem').should('be.visible');
    cy.contains('Spillelister').should('be.visible');
    cy.contains('Opprett').should('be.visible');
    cy.contains('Favoritter').should('be.visible');
    cy.contains('Innstillinger').should('be.visible');
  });

  // Test navigation for each button in the navbar
  it('navigates to playlists when clicking playlists', () => {
    cy.contains('Spillelister').click();

    cy.url().should('include', '/playlists');
  });

  it('navigates to favorites when clicking favorites', () => {
    cy.contains('Favoritter').click();

    cy.url().should('include', '/favorites');
  });

  it('navigates to settings when clicking settings', () => {
    cy.contains('Innstillinger').click();

    cy.url().should('include', '/settings');
  });

  // Verify that the song or playlist box opens when clicking the "Opprett" button
  it('opens song or playlist box when clicking add', () => {
    cy.contains('Opprett').click();

    cy.contains('Send inn sangforslag').should('be.visible');
  });

  // Verify that the box closes when clicking another navbar button
  it('closes song or playlist box when clicking another navbar link', () => {
    cy.contains('Opprett').click();
    cy.contains('Send inn sangforslag').should('be.visible');

    cy.contains('Hjem').click();

    cy.contains('Send inn sangforslag').should('not.exist');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});
