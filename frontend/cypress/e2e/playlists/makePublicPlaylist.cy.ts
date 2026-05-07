const TEST_PASSWORD = 'testpass123';
let createdPlaylistId: string | null = null;

describe('Create public playlist', () => {
  afterEach(() => {
    if (createdPlaylistId) {
      const idToDelete = createdPlaylistId;
      createdPlaylistId = null;

      cy.request({
        method: 'POST',
        url: '/api/playlists',
        body: {
          action: 'delete',
          playlist_id: idToDelete,
          password: TEST_PASSWORD,
        },
        failOnStatusCode: false,
      }).then((res) => {
        cy.log('Delete response:', JSON.stringify(res.body)); // add this
      });
    }
  });

  beforeEach(() => {
    cy.visit('/make_playlist');
  });

  it('creates a public playlist and shows it in the public tab', () => {
    const playlistTitle = `Test spilleliste ${Date.now()}`;

    cy.get('#playlist-title').type(playlistTitle);
    cy.get('#playlist-password').type(TEST_PASSWORD);

    // Open song picker and select first song
    cy.contains('button', 'Velg sanger').click();
    cy.get('[role="dialog"]').within(() => {
      cy.get('li').find('button').first().click();
      cy.contains('1 valgt').should('be.visible');
      cy.contains('button', 'Legg til sanger (1)').click();
    });

    cy.get('[role="dialog"]').should('not.exist');
    cy.contains('Sanger (1)').should('be.visible');

    // Enable public toggle
    cy.get('button[role="switch"]').click();

    // Intercept just to capture the created ID for cleanup — not to mock
    cy.intercept('POST', '/api/playlists').as('savePlaylist');

    // Submit
    cy.contains('button', 'Opprett spilleliste').click();

    cy.wait('@savePlaylist').then((interception) => {
      createdPlaylistId = interception.response?.body?.data?.id ?? null;
      cy.log('createdPlaylistId:', createdPlaylistId); // add this
    });

    // Success toast
    cy.contains('Offentlig spilleliste opprettet!', { timeout: 10000 }).should('be.visible');

    // Redirected to the real playlist page
    cy.url().should('include', '/playlists/playlist?id=', { timeout: 50000 });

    // Playlist page confirms it's public
    cy.contains('Offentlig spilleliste').should('be.visible');

    // Navigate to playlists overview
    cy.visit('/playlists');

    cy.get('[aria-label="public"]').should('have.attr', 'data-state', 'active');
    cy.contains(playlistTitle).scrollIntoView().should('be.visible');

    cy.visit('/make_playlist');
  });

  it('shows an error toast when submitting without songs', () => {
    cy.get('#playlist-title').type('Tom spilleliste');
    cy.get('#playlist-password').type(TEST_PASSWORD);
    cy.get('button[role="switch"]').click();

    cy.contains('button', 'Opprett spilleliste').click();

    cy.contains('Velg minst én sang').should('be.visible');
  });

  it('disables the public toggle and shows warning when offline', () => {
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(false);
      win.dispatchEvent(new Event('offline'));
    });

    cy.get('button[role="switch"]').should('be.disabled');
    cy.contains('Du er offline').should('be.visible');

    // Restore online
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(true);
      win.dispatchEvent(new Event('online'));
    });
  });
});
