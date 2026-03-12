describe('Theme toggle', () => {
  it('should show the correct theme and toggle theme and labels', () => {
    cy.visit('http://localhost:3000/settings', {
      onBeforeLoad(win: Window) {
        win.localStorage.setItem('theme', 'dark');
      },
    });

    // Verify the initial label is correct for dark mode, wait until text appears
    cy.contains('Bytt til lys modus', { timeout: 10000 }).should('be.visible');

    // Toggle to light
    cy.get('input[type="checkbox"]').click();
    cy.get('html.theme-ready', { timeout: 10000 }).should('exist');

    cy.contains('Bytt til mørk modus').should('be.visible');
    cy.window().its('localStorage.theme').should('eq', 'light');

    // Toggle back to dark
    cy.get('input[type="checkbox"]').click();
    cy.get('html.theme-ready', { timeout: 10000 }).should('exist');
    cy.contains('Bytt til lys modus').should('be.visible');
    cy.window().its('localStorage.theme').should('eq', 'dark');
  });
});

describe('Theme persistence', () => {
  it('keeps theme after reload', () => {
    cy.visit('http://localhost:3000/settings', {
      onBeforeLoad(win) {
        win.localStorage.setItem('theme', 'dark');
      },
    });

    // Switch to light and reload page
    cy.get('input[type="checkbox"]').click();
    cy.reload();

    // Check if still is light mode
    cy.contains('Bytt til mørk modus').should('be.visible');
    cy.window().its('localStorage.theme').should('eq', 'light');
  });
});
