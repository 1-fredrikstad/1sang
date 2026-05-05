type AdminSong = {
  id: string;
  slug: string;
};

describe('Admin edit song', () => {
  const title = `EditTest song ${Date.now().toString().slice(-8)}`;
  const originalVerse = 'Dette er det opprinnelige verset over tjue tegn.';
  const updatedVerse = 'Dette er det oppdaterte verset over tjue tegn.';
  let songSlug: string;

  // Seed a song to edit, and delete it after the test + after test cleanup
  before(() => {
    cy.request({
      method: 'POST',
      url: '/api/songs',
      headers: { 'Content-Type': 'application/json' },
      body: {
        title,
        melody: '',
        author: '',
        chorus: '',
        verses: [originalVerse],
        spotify_youtube: '',
        has_chords: false,
        tags: [],
      },
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property('destination', 'songs');
      const song = res.body.data as AdminSong;
      songSlug = song.slug;
    });
  });

  after(() => {
    cy.env(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']).then((env) => {
      cy.request({
        method: 'DELETE',
        url: `${env.SUPABASE_URL}/rest/v1/songs?title=eq.${encodeURIComponent(title)}`,
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        failOnStatusCode: false,
      });
    });
  });

  it('edits a song as admin and sees updated lyrics on the song page', () => {
    cy.intercept('PATCH', '**/api/songs/*').as('updateSong');

    cy.visit('/');
    cy.contains(title, { timeout: 20000 }).should('exist');

    // Edit the song
    cy.visit(`/songs/edit?slug=${songSlug}`);
    cy.get('[name="verses.0"]', { timeout: 20000 }).should('have.value', originalVerse);
    cy.get('[name="verses.0"]').clear().type(updatedVerse);
    cy.contains('button', 'Lagre endringer').click();

    cy.wait('@updateSong').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
    });

    // Verify that the updated verse appears on the song page
    cy.location('pathname', { timeout: 20000 }).should('eq', '/songs');
    cy.contains(updatedVerse, { timeout: 20000 }).should('be.visible');
    cy.contains(originalVerse).should('not.exist');
  });
});
