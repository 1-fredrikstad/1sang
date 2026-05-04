describe('Private playlist', () => {
  const suffix = Date.now().toString().slice(-6);
  const playlistTitle = `Testspilleliste ${suffix}`;
  const updatedTitle = `Oppdatert spilleliste ${suffix}`;

  beforeEach(() => {
    // Clear dexie (IndexedDB) before each test to ensure clean state
    cy.window().then((win) => {
      win.indexedDB.deleteDatabase('1sang');
    });
  });

  it('Create, view and edit a private playlist', () => {
    cy.intercept('GET', '/api/playlists*', {
      statusCode: 200,
      body: { ok: true, data: [] },
    });

    // Make a private playlist
    cy.visit('/make_playlist');
    cy.get('#playlist-title').type(playlistTitle);
    cy.get('#playlist-password').type('Test1234');
    cy.contains('button', 'Velg sanger').click();
    cy.get('[role="dialog"] li button').first().click();
    cy.get('[role="dialog"]')
      .contains('button', /Legg til sanger/)
      .click();

    cy.contains('button', 'Opprett spilleliste').click();

    // Verify that the playlist appear in the private playlist page
    cy.visit('/playlists');
    cy.contains('button', 'Private').click();
    cy.contains(playlistTitle).should('be.visible');

    // Edit the private playlist
    cy.contains(playlistTitle).click();
    cy.get('button.p-2').click();
    cy.contains('Rediger spilleliste').click();
    cy.wait(500);
    cy.get('#playlist-title').clear().type(updatedTitle);
    cy.contains('button', 'Lagre endringer').click();

    // Verify that the changes are made to the private playlist
    cy.visit('/playlists');
    cy.contains('button', 'Private').click();
    cy.contains(updatedTitle).should('be.visible');
  });
});
