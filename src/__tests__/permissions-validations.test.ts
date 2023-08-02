const { authorize } = require("../permissions-validations");

test("Test one role and all scopes without conditions", () => {
  const permissions = [
    {
      role: "ejecutivo.de.cuentas",
      resource: "urn:cuenta",
      scopes: "*",
      effect: "allow",
      conditions: [],
    },
  ];

  const result = authorize(
    ["ejecutivo.de.cuentas"],
    "urn:cuenta",
    "view",
    permissions
  );


  expect(result.authorized).toBeTruthy();
  // Es mejor undefined o [[]].
  expect(result.conditionAlternatives).toBeUndefined();
});
