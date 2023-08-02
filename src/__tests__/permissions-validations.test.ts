import { authorize } from "../permissions-validations";
import type { Permission } from "../permissions-validations";

test("Permission with one resource and any scopes without conditions, access granted", () => {
  const permissions: Permission[] = [
    {
      id: 1,
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
  expect(result.matchingPermissions).toEqual([1]);
});

test("Permission with one resource and any scopes without conditions 2, access denied", () => {
  const permissions: Permission[] = [
    {
      id: 2,
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
  expect(result.matchingPermissions).toEqual([]);
});

test("Permission with any resource and a single scope and all scopes without conditions, access denied", () => {
  const permissions: Permission[] = [
    {
      id: 3,
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
      id: 4,
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
      id: 5,
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
      id: 6,
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
      id: 7,
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
      id: 8,
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
        matchingPermissions: [8],
        attribute: "companyName",
        operator: "equals",
        value: "Compañia SRL",
      },
      {
        matchingPermissions: [8],
        attribute: "zone",
        operator: "equals",
        value: "Norte",
      },
    ],
  ]);
  expect(result.matchingPermissions).toEqual([8]);
});

test("Permission with conditions with matching pattern", () => {
  const permissions: Permission[] = [
    {
      id: 9,
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
      id: 10,
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
      id: 11,
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
    "urn:report",
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
        matchingPermissions: [11,10]
      },
    ],
  ]);
  expect(result.matchingPermissions).toEqual([10]);
});

test("Permission with conditions pattern that doesn't match", () => {
  const permissions: Permission[] = [
    {
      id: 12,
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
      id: 13,
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
      id: 14,
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

  expect(() =>
    authorize(
      ["account.executive", "company.srl"],
      "urn:account",
      "view",
      permissions
    )
  ).toThrow();
});

test("Permission with conditions with multiple patterns, throws error", () => {
  const permissions: Permission[] = [
    {
      id: 15,
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
      id: 16,
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
      id: 17,
      role: "company.srl.north",
      resource: "?",
      scopes: "?",
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
          value: "North",
        },
      ],
    },
  ];

  expect(() =>
    authorize(
      ["account.executive", "company.srl.north"],
      "urn:account",
      "view",
      permissions
    )
  ).toThrow();
});

test("Different roles grant alternative conditions", () => {
  const permissions: Permission[] = [
    {
      id: 8,
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
      ],
    },
    {
      id: 9,
      role: "north.zone.account.administrator",
      resource: "urn:account",
      scopes: ["view", "administrate"],
      effect: "allow",
      conditions: [
        {
          attribute: "zone",
          operator: "equals",
          value: "North",
        },
      ],
    },
  ];

  const result = authorize(
    ["company.srl.account.administrator", "north.zone.account.administrator"],
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
        matchingPermissions: [8],
      },
    ],
    [
      {
        attribute: "zone",
        operator: "equals",
        value: "North",
        matchingPermissions: [9],
      },
    ],
  ]);
  expect(result.matchingPermissions).toEqual([8, 9]);
});
