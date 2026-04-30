type SongSuggestion = {
  id: string;
  verses: string[];
};

describe('AdminSongsuggestionActions', () => {
  const title1 = `TestOne song ${Date.now().toString().slice(-8)}`;
  const title2 = `TestTwo song ${Date.now().toString().slice(-8)}`;
  const suggestionId1 = crypto.randomUUID();
  const suggestionId2 = crypto.randomUUID();
  const verse = 'Dette er et testvers som har mer enn tjue tegn.';

  //Create two song suggestions in the database for testing
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
        url: `${env.SUPABASE_URL}/rest/v1/song_suggestions`,
        headers,
        body: {
          id: suggestionId1,
          title: title1,
          ...baseBody,
        },
      });

      cy.request({
        method: 'POST',
        url: `${env.SUPABASE_URL}/rest/v1/song_suggestions`,
        headers,
        body: {
          id: suggestionId2,
          title: title2,
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

      // Delete the accepted song-suggestion from the database
      cy.request({
        method: 'DELETE',
        url: `${env.SUPABASE_URL}/rest/v1/songs?title=eq.${encodeURIComponent(title1)}`,
        headers,
        failOnStatusCode: false,
      });
    });
  });

  it('approves a song suggestion and verifies it on the homepage', () => {
    // Ensure the test suggestion has verses in the same shape the UI expects.
    // This avoids having to set up the full Dexie/IndexedDB sync in the test.
    cy.intercept('GET', '**/rest/v1/song_suggestions?select=*', (req) => {
      req.continue((res) => {
        const suggestions = res.body as SongSuggestion[];

        res.body = suggestions.map((suggestion) =>
          suggestion.id === suggestionId1 ? { ...suggestion, verses: [verse] } : suggestion
        );
      });
    });

    cy.intercept('POST', '**/admin/suggestions?id=*').as('approveSuggestion');

    cy.visit('/admin/dashboard');

    cy.contains('Inkomne sangforslag', { timeout: 10000 }).should('be.visible');

    cy.contains(title1, { timeout: 20000 }).scrollIntoView().click({ force: true });

    cy.contains('button', 'Godkjenn', { timeout: 20000 }).should('exist').click({ force: true });

    cy.wait('@approveSuggestion').its('response.statusCode').should('eq', 200);

    cy.visit('/');

    cy.contains(title1, { timeout: 20000 }).should('exist').scrollIntoView().should('be.visible');
  });

  it('rejetes song suggestion and vertify that it is gone', () => {
    cy.intercept('GET', '**/rest/v1/song_suggestions?select=*', (req) => {
      req.continue((res) => {
        const suggestions = res.body as SongSuggestion[];

        res.body = suggestions.map((suggestion) =>
          suggestion.id === suggestionId2 ? { ...suggestion, verses: [verse] } : suggestion
        );
      });
    });

    cy.intercept('DELETE', '**/admin/suggestions?id=*').as('rejectSuggestion');

    cy.visit('/admin/dashboard');

    cy.contains('Inkomne sangforslag', { timeout: 10000 }).should('be.visible');

    cy.contains(title2, { timeout: 20000 }).scrollIntoView().click({ force: true });

    cy.contains('button', 'Avvis', { timeout: 20000 }).should('exist').click({ force: true });

    cy.contains('button', 'Avvis og slett', { timeout: 20000 })
      .should('exist')
      .click({ force: true });

    cy.visit('/admin/dashboard');

    cy.contains(title2, { timeout: 20000 }).should('not.exist');

    cy.visit('/');

    cy.contains(title2, { timeout: 20000 }).should('not.exist');
  });
});
