import { authorize } from "../permissions-validations";
import type { Permission } from "../permissions-validations";

test("Permission with one resource and any scopes without conditions, access granted", () => {
  const permissions: Permission[] = [
    {
      role: "account.executive",
      resource: "urn:account",
      scopes: "*",
      effect: "allow",
      conditions: [],
    },
  ];

  const result = authorize(
    ["account.executive"],
    "urn:account",
    "view",
    permissions
  );

  expect(result.authorized).toBeTruthy();
  expect(result.conditionAlternatives).toBeUndefined();
});

test("Permission with one resource and any scopes without conditions 2, access denied", () => {
  const permissions: Permission[] = [
    {
      role: "account.executive",
      resource: "urn:account",
      scopes: "*",
      effect: "allow",
      conditions: [],
    },
  ];

  const result = authorize(
    ["account.executive"],
    "urn:report",
    "view",
    permissions
  );

  expect(result.authorized).toBeFalsy();
  expect(result.conditionAlternatives).toBeUndefined();
});

test("Permission with any resource and a single scope and all scopes without conditions, access denied", () => {
  const permissions: Permission[] = [
    {
      role: "viewer",
      resource: "*",
      scopes: "view",
      effect: "allow",
      conditions: [],
    },
  ];

  const result = authorize(["viewer"], "urn:account", "view", permissions);

  expect(result.authorized).toBeTruthy();
  expect(result.conditionAlternatives).toBeUndefined();
});

test("Permission is for another role", () => {
  const permissions: Permission[] = [
    {
      role: "viewer",
      resource: "*",
      scopes: "ver",
      effect: "allow",
      conditions: [],
    },
  ];

  const result = authorize(["not.viewer"], "urn:account", "view", permissions);

  expect(result.authorized).toBeFalsy();
  expect(result.conditionAlternatives).toBeUndefined();
});

test("Permission specific resource and scopes without conditions, access granted", () => {
  const permissions: Permission[] = [
    {
      role: "account.viewer",
      resource: "urn:account",
      scopes: ["view", "view_detail"],
      effect: "allow",
      conditions: [],
    },
  ];

  const result = authorize(
    ["account.viewer"],
    "urn:account",
    "view",
    permissions
  );

  expect(result.authorized).toBeTruthy();
  expect(result.conditionAlternatives).toBeUndefined();
});

test("Permission specific resource and scopes without conditions, access denied", () => {
  const permissions: Permission[] = [
    {
      role: "account.viewer",
      resource: "urn:account",
      scopes: ["view", "view_detail"],
      effect: "allow",
      conditions: [],
    },
  ];

  const result = authorize(
    ["account.viewer"],
    "urn:account",
    "edit",
    permissions
  );

  expect(result.authorized).toBeFalsy();
  expect(result.conditionAlternatives).toBeUndefined();
});

test("Permission with full access, granted", () => {
  const permissions: Permission[] = [
    {
      role: "admin",
      resource: "*",
      scopes: "*",
      effect: "allow",
      conditions: [],
    },
  ];

  const result = authorize(["admin"], "urn:account", "edit", permissions);

  expect(result.authorized).toBeTruthy();
  expect(result.conditionAlternatives).toBeUndefined();
});

test("Permission with conditions", () => {
  const permissions: Permission[] = [
    {
      role: "company.srl.account.administrator",
      resource: "urn:account",
      scopes: ["view", "administrate"],
      effect: "allow",
      conditions: [
        {
          attribute: "companyName",
          operator: "equals",
          value: "Compañia SRL",
        },
        {
          attribute: "zone",
          operator: "equals",
          value: "Norte",
        },
      ],
    },
  ];

  const result = authorize(
    ["company.srl.account.administrator"],
    "urn:account",
    "view",
    permissions
  );

  expect(result.authorized).toBeTruthy();
  expect(result.conditionAlternatives).toEqual([
    [
      {
        attribute: "companyName",
        operator: "equals",
        value: "Compañia SRL",
      },
      {
        attribute: "zone",
        operator: "equals",
        value: "Norte",
      },
    ],
  ]);
});

test("Permission with conditions with matching pattern", () => {
  const permissions: Permission[] = [
    {
      role: "account.executive",
      resource: "urn:account",
      scopes: ["view", "administrate"],
      effect: "allow",
      conditions: [
        {
          attribute: "companyName",
          operator: "equals",
          value: "?",
        },
      ],
    },
    {
      role: "account.executive",
      resource: "urn:report",
      scopes: ["view", "download"],
      effect: "allow",
      conditions: [
        {
          attribute: "companyName",
          operator: "equals",
          value: "?",
        },
      ],
    },
    {
      role: "company.srl",
      resource: "?",
      scopes: "?",
      effect: "allow",
      conditions: [
        {
          attribute: "companyName",
          operator: "equals",
          value: "Compañia SRL",
        },
      ],
    },
  ];

  const result = authorize(
    ["account.executive", "company.srl"],
    "urn:account",
    "view",
    permissions
  );

  expect(result.authorized).toBeTruthy();
  expect(result.conditionAlternatives).toEqual([
    [
      {
        attribute: "companyName",
        operator: "equals",
        value: "Compañia SRL",
      },
    ],
  ]);
});

test("Permission with conditions pattern that doesn't match", () => {
  const permissions: Permission[] = [
    {
      role: "account.executive",
      resource: "urn:account",
      scopes: ["view", "administrate"],
      effect: "allow",
      conditions: [
        {
          attribute: "companyName",
          operator: "equals",
          value: "?",
        },
      ],
    },
    {
      role: "account.executive",
      resource: "urn:report",
      scopes: ["view", "download"],
      effect: "allow",
      conditions: [
        {
          attribute: "companyName",
          operator: "equals",
          value: "?",
        },
      ],
    },
    {
      role: "company.srl",
      resource: "?",
      scopes: "?",
      effect: "allow",
      conditions: [
        {
          attribute: "unrelatedAttribute",
          operator: "equals",
          value: "Compañia SRL",
        },
      ],
    },
  ];

  const result = authorize(
    ["account.executive", "company.srl"],
    "urn:account",
    "view",
    permissions
  );

  expect(result.authorized).toThrow();
  expect(result.conditionAlternatives).toBeUndefined();

});
