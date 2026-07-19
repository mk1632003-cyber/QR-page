module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    // FIX: Tells Cypress it's perfectly fine that we don't have a support file yet
    supportFile: false, 
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
};
