type Song = {
  id: string;
  verses: string[];
};

describe('Favorites', () => {
  const title1 = `TestFavoritesOne song ${Date.now().toString().slice(-8)}`;
  const songId1 = crypto.randomUUID();
  const verse = 'Dette er et testvers som har mer enn tjue tegn.';

  //Create a song in the database for testing
  before(() => {
    cy.env(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']).then((env) => {
      const headers = {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      };

      const baseBody = {
        melody: '',
        author: '',
        chorus: '',
        verses: [verse],
        spotify_youtube: '',
        has_chords: false,
      };

      cy.request({
        method: 'POST',
        url: `${env.SUPABASE_URL}/rest/v1/songs`,
        headers,
        body: {
          id: songId1,
          title: title1,
          ...baseBody,
        },
      });
    });
  });

  after(() => {
    cy.env(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']).then((env) => {
      const headers = {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      };

      // Delete the song from the database
      cy.request({
        method: 'DELETE',
        url: `${env.SUPABASE_URL}/rest/v1/songs?title=eq.${encodeURIComponent(title1)}`,
        headers,
        failOnStatusCode: false,
      });
    });
  });

  it('mark a song as favorite, see it on the favorites-page, remove it as favorite and do not see it on favorites-page anymore', () => {
    // Ensure the test song has verses in the same shape the UI expects.
    // This avoids having to set up the full Dexie/IndexedDB sync in the test.
    cy.intercept('GET', '**/rest/v1/songs?select=*', (req) => {
      req.continue((res) => {
        const suggestions = res.body as Song[];

        res.body = suggestions.map((song) =>
          song.id === songId1 ? { ...song, verses: [verse] } : song
        );
      });
    });

    // Mark song as favorite and see it on favorites-page
    cy.visit('/');

    cy.contains('article', title1, { timeout: 40000 })
      .scrollIntoView()
      .find('[aria-label="Legg til i favoritter"]')
      .click({ force: true });

    cy.visit('/favorites');

    cy.contains(title1, { timeout: 40000 }).should('exist').scrollIntoView().should('be.visible');

    // Remove song as favorite
    cy.contains('article', title1, { timeout: 40000 })
      .scrollIntoView()
      .find('[aria-label="Fjern fra favoritter"]')
      .click({ force: true });

    cy.contains(title1, { timeout: 40000 }).should('not.exist');
  });
});
