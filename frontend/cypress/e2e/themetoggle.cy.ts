describe('Theme toggle', () => {
  it('should show the correct theme and toggle theme and labels', () => {
    cy.visit('/settings', {
      onBeforeLoad(win: Window) {
        win.localStorage.setItem('theme', 'dark');
      },
    });

    // Verify the initial label is correct for dark mode, wait until text appears
    cy.contains('Bytt til lys modus', { timeout: 10000 }).should('be.visible');
    cy.get('html').should('have.class', 'dark');

    // Toggle to light
    cy.get('[role="switch"]').eq(1).click();
    cy.get('html.theme-ready', { timeout: 10000 }).should('exist');

    cy.contains('Bytt til mørk modus').should('be.visible');
    cy.window().its('localStorage.theme').should('eq', 'light');
    cy.get('html').should('not.have.class', 'dark');

    // Toggle back to dark
    cy.get('[role="switch"]').eq(1).click();
    cy.get('html.theme-ready', { timeout: 10000 }).should('exist');
    cy.contains('Bytt til lys modus').should('be.visible');
    cy.window().its('localStorage.theme').should('eq', 'dark');
    cy.get('html').should('not.have.class', 'light');
  });
});

describe('Theme persistence', () => {
  it('keeps theme after reload', () => {
    cy.visit('/settings', {
      onBeforeLoad(win) {
        win.localStorage.setItem('theme', 'dark');
      },
    });

    // Switch to light and reload page
    cy.get('[role="switch"]').eq(1).click();
    cy.reload();

    // Check if still is light mode
    cy.contains('Bytt til mørk modus').should('be.visible');
    cy.window().its('localStorage.theme').should('eq', 'light');
  });
});
