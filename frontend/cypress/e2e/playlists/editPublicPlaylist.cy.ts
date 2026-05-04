// cypress/e2e/editPlaylist.cy.ts

const TEST_PASSWORD_EDIT = 'testpass123';
const NEW_PASSWORD = 'newpass456';
let playlistId: string | null = null;

// Creates a fresh playlist with one song via API and returns its id
function createTestPlaylist(): Cypress.Chainable<string> {
  return cy
    .request({
      method: 'POST',
      url: '/api/playlists',
      body: {
        action: 'create',
        title: 'Test spilleliste',
        password: TEST_PASSWORD_EDIT,
        is_public: true,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    })
    .then((res) => {
      const id = res.body.data.id as string;

      // Add one song so the playlist is never empty (required by validation)
      return cy.request('/api/songs').then((songsRes) => {
        const firstSongId = songsRes.body.data[0].id as string;

        return cy
          .request({
            method: 'POST',
            url: '/api/playlists',
            body: {
              action: 'add_item',
              playlist_id: id,
              song_id: firstSongId,
              password: TEST_PASSWORD_EDIT,
            },
          })
          .then(() => id);
      });
    });
}

function deleteTestPlaylist(id: string) {
  return cy.request({
    method: 'POST',
    url: '/api/playlists',
    body: {
      action: 'delete',
      playlist_id: id,
      password: TEST_PASSWORD_EDIT,
    },
    failOnStatusCode: false,
  });
}

function visitEditPage(id: string) {
  cy.window().then((win) => {
    win.sessionStorage.setItem(`playlist-password-${id}`, TEST_PASSWORD_EDIT);
  });
  cy.visit(`/playlists/playlist/edit?id=${id}`);
}

describe('Edit public playlist', () => {
  beforeEach(() => {
    createTestPlaylist().then((id) => {
      playlistId = id;
      visitEditPage(id);
      cy.get('#playlist-title').should('be.visible');
    });
  });

  afterEach(() => {
    if (playlistId) {
      deleteTestPlaylist(playlistId);
      playlistId = null;
    }
  });

  // ─── Title ────────────────────────────────────────────────────────────────

  it('can change the title', () => {
    const newTitle = `Redigert spilleliste ${Date.now()}`;

    cy.get('#playlist-title', { timeout: 10000 }).clear().type(newTitle);
    cy.contains('button', 'Lagre endringer').click();

    cy.contains('Spilleliste oppdatert').should('be.visible');
    cy.url().should('include', '/playlists/playlist?id=');
    cy.contains(newTitle).should('be.visible');

    // Reset title for subsequent tests
    cy.then(() => visitEditPage(playlistId!));
    cy.get('#playlist-title', { timeout: 10000 }).clear().type('Test spilleliste');
    cy.contains('button', 'Lagre endringer').click();
    cy.contains('Spilleliste oppdatert').should('be.visible');
  });

  // ─── Songs ────────────────────────────────────────────────────────────────

  it('can add a song', () => {
    cy.get('#playlist-title').should('be.visible');

    cy.contains('button', /Endre sanger|Velg sanger/).click();

    cy.get('[role="dialog"]').within(() => {
      cy.contains('[role="tab"]', /Alle sanger/).click();

      // All songs in this tab are unselected by definition
      cy.get('[role="tabpanel"]').first().find('li button').first().click();

      cy.contains('button', /Lagre endringer/).click();
    });

    cy.get('[role="dialog"]').should('not.exist');
    cy.contains('Sanger (2)').should('be.visible');

    cy.contains('button', 'Lagre endringer').click();
    cy.contains('Spilleliste oppdatert').should('be.visible');
  });

  it('can remove a song', () => {
    // Add a second song so can remove one and still meet the minimum
    cy.request('/api/songs').then((res) => {
      const secondSongId = res.body.data[1].id as string;
      cy.request({
        method: 'POST',
        url: '/api/playlists',
        body: {
          action: 'add_item',
          playlist_id: playlistId,
          song_id: secondSongId,
          password: TEST_PASSWORD_EDIT,
        },
      });
    });

    cy.reload();

    cy.contains('button', /Endre sanger|Velg sanger/).click();

    cy.get('[role="dialog"]').within(() => {
      cy.contains('[role="tab"]', /Valgte sanger/).click();

      cy.get('[role="tabpanel"]').last().find('li button').first().click();

      cy.contains('button', /Lagre endringer/).click();
    });

    cy.get('[role="dialog"]').should('not.exist');
    cy.contains('button', 'Lagre endringer').click();
    cy.contains('Spilleliste oppdatert').should('be.visible');
  });

  // ─── Password ─────────────────────────────────────────────────────────────

  it('can change the password', () => {
    cy.get('#playlist-new-password').type(NEW_PASSWORD);
    cy.contains('button', 'Lagre endringer').click();
    cy.contains('Spilleliste oppdatert').should('be.visible');

    // Reset password back so subsequent tests still work
    cy.window().then((win) => {
      win.sessionStorage.setItem(`playlist-password-${playlistId}`, NEW_PASSWORD);
    });
    cy.visit(`/playlists/playlist/edit?id=${playlistId}`);
    cy.get('#playlist-new-password').type(TEST_PASSWORD_EDIT);

    // send new password as current for the API
    cy.window().then((win) => {
      win.sessionStorage.setItem(`playlist-password-${playlistId}`, NEW_PASSWORD);
    });

    cy.contains('button', 'Lagre endringer').click();
    cy.contains('Spilleliste oppdatert').should('be.visible');

    // Restore sessionStorage to original password for afterEach
    cy.window().then((win) => {
      win.sessionStorage.setItem(`playlist-password-${playlistId}`, TEST_PASSWORD_EDIT);
    });
  });

  // ─── Make private ─────────────────────────────────────────────────────────

  it('can make the playlist private', () => {
    cy.get('button[role="switch"]').click();
    cy.contains('button', 'Lagre endringer').click();

    cy.contains('Spilleliste gjort privat og lagret lokalt').should('be.visible');
    cy.url().should('include', '/playlists/playlist?id=');
    cy.contains('Privat spilleliste').should('be.visible');

    // Recreate the public playlist so the remaining tests and cleanup still work
    cy.then(() => {
      createTestPlaylist().then((newId) => {
        playlistId = newId;
      });
    });
  });

  // ─── Delete ───────────────────────────────────────────────────────────────

  it('can delete the playlist', () => {
    cy.contains('button', 'Slett spilleliste').click();

    // Confirm in the alert dialog
    cy.get('[role="alertdialog"]').within(() => {
      cy.contains('button', 'Slett').click();
    });

    cy.contains('Spilleliste slettet').should('be.visible');
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // Playlist is gone — null out so after() doesn't try to delete it again
    cy.then(() => {
      playlistId = null;
    });
  });
});
