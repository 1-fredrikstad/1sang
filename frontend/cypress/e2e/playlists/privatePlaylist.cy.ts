describe('makePrivatePlaylist', () => {
  const songTitle = `Test playlist song ${Date.now().toString().slice(-8)}`;
  const playlistTitle = `Privat testspilleliste ${Date.now().toString().slice(-8)}`;
  const playlistPassword = 'test1234';

  //put a song in the test databse
  before(() => {
    cy.env(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']).then((env) => {
      const headers = {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      };

      cy.request({
        method: 'POST',
        url: `${env.SUPABASE_URL}/rest/v1/songs`,
        headers,
        body: {
          title: songTitle,
          melody: '',
          author: '',
          chorus: '',
          verses: ['Dette er et testvers som har mer enn tjue tegn.'],
          spotify_youtube: '',
          has_chords: false,
        },
      });
    });
  });

  //delete both song and playlist after test
  after(() => {
    cy.env(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']).then((env) => {
      const headers = {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      };

      cy.request({
        method: 'DELETE',
        url: `${env.SUPABASE_URL}/rest/v1/playlists?title=eq.${encodeURIComponent(playlistTitle)}`,
        headers,
        failOnStatusCode: false,
      });

      cy.request({
        method: 'DELETE',
        url: `${env.SUPABASE_URL}/rest/v1/songs?title=eq.${encodeURIComponent(songTitle)}`,
        headers,
        failOnStatusCode: false,
      });
    });
  });

  it('creates a private playlist and verifies it is saved', () => {
    cy.visit('/');

    cy.contains('Opprett', { timeout: 10000 }).click();

    cy.contains('Lag ny spilleliste', { timeout: 10000 }).click();

    cy.contains('Tittel').should('be.visible');

    cy.get('input[name="title"]').type(playlistTitle);

    cy.get('input[type="password"]').type(playlistPassword);

    cy.contains('Velg sanger').click();

    cy.contains(songTitle, { timeout: 20000 }).scrollIntoView().click();

    cy.contains('Legg til sanger (1)').click();

    cy.contains('Opprett spilleliste').click();

    cy.visit('/playlists');

    cy.contains('Private').click();

    cy.contains(playlistTitle, { timeout: 20000 }).click();

    cy.contains(songTitle, { timeout: 20000 }).should('be.visible');
  });
});
