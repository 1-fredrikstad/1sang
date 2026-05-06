describe('Admin publish song', () => {
  const title = `Test song ${Date.now().toString().slice(-8)}`;
  const verse = 'Dette er et testvers som har mer enn tjue tegn.';
  const chorus = 'Dette er et testrefreng la la la lalalalalallalalala';

  // Delete test song after run
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

  it('publishes a song as an admin and verifies it on homepage', () => {
    cy.intercept('POST', '**/api/songs').as('createSong');

    cy.visit('/');
    cy.contains('Opprett').should('be.visible').click();
    cy.contains('button', 'Publiser sang').should('be.visible').click();

    // Fill out SongForm to create a new song
    cy.get('#form-add-song-title').type(title);
    cy.get('[name="verses.0"]').type(verse);

    cy.contains('button', '+ Legg til refreng').click();
    cy.get('[name="chorus"]').type(chorus);

    // Publish the song
    cy.contains('button', 'Publiser').click();

    cy.wait('@createSong').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
      expect(interception.response?.body).to.have.property('destination', 'songs');
    });

    // Verify that the song appears on the homepage
    cy.visit('/');
    cy.contains(title, { timeout: 20000 }).should('exist').scrollIntoView().should('be.visible');
  });
});
