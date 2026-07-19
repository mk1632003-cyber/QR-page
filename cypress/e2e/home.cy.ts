describe("Home Page", () => {
  it("loads successfully", () => {
    cy.visit("http://localhost:3000");

    cy.get("body").should("be.visible");
    cy.title().should("not.be.empty");
  });
});
