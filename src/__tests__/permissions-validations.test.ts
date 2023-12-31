import { authorize } from '../permissions-validations';
import type { Permission } from '../permissions-validations';

test('Permission with one resource and any scopes without conditions, access granted', () => {
  const permissions: Permission[] = [
    {
      id: 1,
      role: 'account.executive',
      resource: 'urn:account',
      scopes: '*',
      effect: 'allow',
      conditions: [],
    },
  ];

  const result = authorize(
    ['account.executive'],
    'urn:account',
    'view',
    permissions,
  );

  expect(result.authorized).toBe(true);
  expect(result.conditionAlternatives).toBeUndefined();
  expect(result.matchingPermissions).toEqual([1]);
});

test('Permission with one resource and any scopes without conditions 2, access denied', () => {
  const permissions: Permission[] = [
    {
      id: 2,
      role: 'account.executive',
      resource: 'urn:account',
      scopes: '*',
      effect: 'allow',
      conditions: [],
    },
  ];

  const result = authorize(
    ['account.executive'],
    'urn:report',
    'view',
    permissions,
  );

  expect(result.authorized).toBe(false);
  expect(result.conditionAlternatives).toBeUndefined();
  expect(result.matchingPermissions).toEqual([]);
});

test('Permission with any resource and a single scope and all scopes without conditions, access denied', () => {
  const permissions: Permission[] = [
    {
      id: 3,
      role: 'viewer',
      resource: '*',
      scopes: ['view'],
      effect: 'allow',
      conditions: [],
    },
  ];

  const result = authorize(['viewer'], 'urn:account', 'view', permissions);

  expect(result.authorized).toBe(true);
  expect(result.conditionAlternatives).toBeUndefined();
});

test('Permission is for another role', () => {
  const permissions: Permission[] = [
    {
      id: 4,
      role: 'viewer',
      resource: '*',
      scopes: ['viewer'],
      effect: 'allow',
      conditions: [],
    },
  ];

  const result = authorize(['not.viewer'], 'urn:account', 'view', permissions);

  expect(result.authorized).toBe(false);
  expect(result.conditionAlternatives).toBeUndefined();
});

test('Permission specific resource and scopes without conditions, access granted', () => {
  const permissions: Permission[] = [
    {
      id: 5,
      role: 'account.viewer',
      resource: 'urn:account',
      scopes: ['view', 'view_detail'],
      effect: 'allow',
      conditions: [],
    },
  ];

  const result = authorize(
    ['account.viewer'],
    'urn:account',
    'view',
    permissions,
  );

  expect(result.authorized).toBe(true);
  expect(result.conditionAlternatives).toBeUndefined();
});

test('Permission specific resource and scopes without conditions, access denied', () => {
  const permissions: Permission[] = [
    {
      id: 6,
      role: 'account.viewer',
      resource: 'urn:account',
      scopes: ['view', 'view_detail'],
      effect: 'allow',
      conditions: [],
    },
  ];

  const result = authorize(
    ['account.viewer'],
    'urn:account',
    'edit',
    permissions,
  );

  expect(result.authorized).toBe(false);
  expect(result.conditionAlternatives).toBeUndefined();
});

test('Permission with full access, granted', () => {
  const permissions: Permission[] = [
    {
      id: 7,
      role: 'admin',
      resource: '*',
      scopes: '*',
      effect: 'allow',
      conditions: [],
    },
  ];

  const result = authorize(['admin'], 'urn:account', 'edit', permissions);

  expect(result.authorized).toBe(true);
  expect(result.conditionAlternatives).toBeUndefined();
});

test('Permission with conditions', () => {
  const permissions: Permission[] = [
    {
      id: 8,
      role: 'company.srl.account.administrator',
      resource: 'urn:account',
      scopes: ['view', 'administrate'],
      effect: 'allow',
      conditions: [
        {
          attribute: 'companyName',
          operator: 'equals',
          value: 'Compañia SRL',
        },
        {
          attribute: 'zone',
          operator: 'equals',
          value: 'Norte',
        },
      ],
    },
  ];

  const result = authorize(
    ['company.srl.account.administrator'],
    'urn:account',
    'view',
    permissions,
  );

  expect(result.authorized).toBe(true);
  expect(result.conditionAlternatives).toEqual([
    [
      {
        matchingPermissions: [8],
        attribute: 'companyName',
        operator: 'equals',
        value: 'Compañia SRL',
      },
      {
        matchingPermissions: [8],
        attribute: 'zone',
        operator: 'equals',
        value: 'Norte',
      },
    ],
  ]);
  expect(result.matchingPermissions).toEqual([8]);
});

test('Permission with conditions with matching pattern', () => {
  const permissions: Permission[] = [
    {
      id: 9,
      role: 'account.executive',
      resource: 'urn:account',
      scopes: ['view', 'administrate'],
      effect: 'allow',
      conditions: [
        {
          attribute: 'companyName',
          operator: 'equals',
          value: '?',
        },
      ],
    },
    {
      id: 10,
      role: 'account.executive',
      resource: 'urn:report',
      scopes: ['view', 'download'],
      effect: 'allow',
      conditions: [
        {
          attribute: 'companyName',
          operator: 'equals',
          value: '?',
        },
      ],
    },
    {
      id: 11,
      role: 'company.srl',
      resource: '?',
      scopes: '?',
      effect: 'allow',
      conditions: [
        {
          attribute: 'companyName',
          operator: 'equals',
          value: 'Compañia SRL',
        },
      ],
    },
  ];

  const result = authorize(
    ['account.executive', 'company.srl'],
    'urn:report',
    'view',
    permissions,
  );

  expect(result.authorized).toBe(true);
  expect(result.conditionAlternatives).toEqual([
    [
      {
        attribute: 'companyName',
        operator: 'equals',
        value: 'Compañia SRL',
        matchingPermissions: [11, 10],
      },
    ],
  ]);
  expect(result.matchingPermissions).toEqual([10]);
});

test("Permission with conditions pattern that doesn't match", () => {
  const permissions: Permission[] = [
    {
      id: 12,
      role: 'account.executive',
      resource: 'urn:account',
      scopes: ['view', 'administrate'],
      effect: 'allow',
      conditions: [
        {
          attribute: 'companyName',
          operator: 'equals',
          value: '?',
        },
      ],
    },
    {
      id: 13,
      role: 'account.executive',
      resource: 'urn:report',
      scopes: ['view', 'download'],
      effect: 'allow',
      conditions: [
        {
          attribute: 'companyName',
          operator: 'equals',
          value: '?',
        },
      ],
    },
    {
      id: 14,
      role: 'company.srl',
      resource: '?',
      scopes: '?',
      effect: 'allow',
      conditions: [
        {
          attribute: 'unrelatedAttribute',
          operator: 'equals',
          value: 'Compañia SRL',
        },
      ],
    },
  ];

  expect(() =>
    authorize(
      ['account.executive', 'company.srl'],
      'urn:account',
      'view',
      permissions,
    ),
  ).toThrow();
});

test('Permission with conditions with multiple patterns, throws error', () => {
  const permissions: Permission[] = [
    {
      id: 15,
      role: 'account.executive',
      resource: 'urn:account',
      scopes: ['view', 'administrate'],
      effect: 'allow',
      conditions: [
        {
          attribute: 'companyName',
          operator: 'equals',
          value: '?',
        },
      ],
    },
    {
      id: 16,
      role: 'account.executive',
      resource: 'urn:report',
      scopes: ['view', 'download'],
      effect: 'allow',
      conditions: [
        {
          attribute: 'companyName',
          operator: 'equals',
          value: '?',
        },
      ],
    },
    {
      id: 17,
      role: 'company.srl.north',
      resource: '?',
      scopes: '?',
      effect: 'allow',
      conditions: [
        {
          attribute: 'companyName',
          operator: 'equals',
          value: 'Compañia SRL',
        },
        {
          attribute: 'zone',
          operator: 'equals',
          value: 'North',
        },
      ],
    },
  ];

  expect(() =>
    authorize(
      ['account.executive', 'company.srl.north'],
      'urn:account',
      'view',
      permissions,
    ),
  ).toThrow();
});

test('Different roles grant alternative conditions', () => {
  const permissions: Permission[] = [
    {
      id: 8,
      role: 'company.srl.account.administrator',
      resource: 'urn:account',
      scopes: ['view', 'administrate'],
      effect: 'allow',
      conditions: [
        {
          attribute: 'companyName',
          operator: 'equals',
          value: 'Compañia SRL',
        },
      ],
    },
    {
      id: 9,
      role: 'north.zone.account.administrator',
      resource: 'urn:account',
      scopes: ['view', 'administrate'],
      effect: 'allow',
      conditions: [
        {
          attribute: 'zone',
          operator: 'equals',
          value: 'North',
        },
      ],
    },
  ];

  const result = authorize(
    ['company.srl.account.administrator', 'north.zone.account.administrator'],
    'urn:account',
    'view',
    permissions,
  );

  expect(result.authorized).toBe(true);
  expect(result.conditionAlternatives).toEqual([
    [
      {
        attribute: 'companyName',
        operator: 'equals',
        value: 'Compañia SRL',
        matchingPermissions: [8],
      },
    ],
    [
      {
        attribute: 'zone',
        operator: 'equals',
        value: 'North',
        matchingPermissions: [9],
      },
    ],
  ]);
  expect(result.matchingPermissions).toEqual([8, 9]);
});

test('Deny permissions', () => {
  const permissions: Permission[] = [
    {
      id: 8,
      role: 'basic.viewer',
      resource: '*',
      scopes: ['view'],
      effect: 'allow',
      conditions: [],
    },
    {
      id: 9,
      role: 'basic.viewer',
      resource: 'urn:secret_report',
      scopes: '*',
      effect: 'deny',
      conditions: [],
    },
  ];

  const result = authorize(
    ['basic.viewer'],
    'urn:secret_report',
    'view',
    permissions,
  );

  expect(result.authorized).toBe(false);
  expect(result.conditionAlternatives).toBeUndefined();
  expect(result.matchingPermissions).toEqual([8, 9]);
});

test('Deny permissions take priority', () => {
  const permissions: Permission[] = [
    {
      id: 8,
      role: 'basic.viewer',
      resource: '*',
      scopes: ['view'],
      effect: 'allow',
      conditions: [],
    },
    {
      id: 9,
      role: 'basic.viewer',
      resource: 'urn:secret_report',
      scopes: '*',
      effect: 'deny',
      conditions: [],
    },
    {
      id: 10,
      role: 'secret.viewer',
      resource: 'urn:secret_report',
      scopes: ['view'],
      effect: 'allow',
      conditions: [],
    },
  ];

  const result = authorize(
    ['basic.viewer', 'secret.viewer'],
    'urn:secret_report',
    'view',
    permissions,
  );

  expect(result.authorized).toBe(false);
  expect(result.conditionAlternatives).toBeUndefined();
  expect(result.matchingPermissions).toEqual([8, 9, 10]);
});

test('Test no conditions take priority over some condition', () => {
  const permissions: Permission[] = [
    {
      id: 8,
      role: 'admin',
      resource: '*',
      scopes: '*',
      effect: 'allow',
      conditions: [],
    },
    {
      id: 9,
      role: 'admin.smartfield',
      resource: '*',
      scopes: '*',
      effect: 'allow',
      conditions: [
        {
          attribute: 'appId',
          operator: 'equals',
          value: '3123',
        },
      ],
    },
  ];

  const result = authorize(
    ['admin', 'admin.smartfield'],
    'urn:account',
    'edit',
    permissions,
  );

  expect(result.authorized).toBe(true);
  expect(result.conditionAlternatives).toBeUndefined();
});

test('User is assigned to two zones, throws error', () => {
  const permissions: Permission[] = [
    {
      role: 'operator',
      effect: 'allow',
      resource: 'urn:task',
      scopes: ['create'],
      id: 1,
      conditions: [
        {
          attribute: 'zone',
          operator: 'equals',
          value: '?',
        },
      ],
    },
    {
      role: 'north',
      effect: 'allow',
      resource: '?',
      scopes: '?',
      id: 2,
      conditions: [
        {
          attribute: 'zone',
          operator: 'equals',
          value: 'north',
        },
      ],
    },
    {
      role: 'south',
      effect: 'allow',
      resource: '?',
      scopes: '?',
      id: 2,
      conditions: [
        {
          attribute: 'zone',
          operator: 'equals',
          value: 'south',
        },
      ],
    },
  ];

  expect(() => {
    authorize(
      ['operator', 'north', 'south'],
      'urn:task',
      'create',
      permissions,
    );
  }).toThrow();
});

test('User is assigned to two zones and two companies, throws errors', () => {
  const permissions: Permission[] = [
    {
      role: 'operator',
      effect: 'allow',
      resource: 'urn:task',
      scopes: ['create'],
      id: 1,
      conditions: [
        {
          attribute: 'zone',
          operator: 'equals',
          value: '?',
        },
        {
          attribute: 'company',
          operator: 'equals',
          value: '?',
        },
      ],
    },
    {
      role: 'north',
      effect: 'allow',
      resource: '?',
      scopes: '?',
      id: 2,
      conditions: [
        {
          attribute: 'zone',
          operator: 'equals',
          value: 'north',
        },
      ],
    },
    {
      role: 'south',
      effect: 'allow',
      resource: '?',
      scopes: '?',
      id: 2,
      conditions: [
        {
          attribute: 'zone',
          operator: 'equals',
          value: 'south',
        },
      ],
    },
    {
      role: 'companyA',
      effect: 'allow',
      resource: '?',
      scopes: '?',
      id: 2,
      conditions: [
        {
          attribute: 'company',
          operator: 'equals',
          value: 'companyA',
        },
      ],
    },
    {
      role: 'companyB',
      effect: 'allow',
      resource: '?',
      scopes: '?',
      id: 2,
      conditions: [
        {
          attribute: 'company',
          operator: 'equals',
          value: 'companyB',
        },
      ],
    },
  ];

  expect(() =>
    authorize(
      ['operator', 'north', 'south', 'companyA', 'companyB'],
      'urn:task',
      'create',
      permissions,
    ),
  ).toThrow();
});

test('In conditions ? with multiple possible values, values alternatives are sum Up', () => {
  const permissions: Permission[] = [
    {
      role: 'operator',
      effect: 'allow',
      resource: 'urn:task',
      scopes: ['create'],
      id: 1,
      conditions: [
        {
          attribute: 'zone',
          operator: 'in',
          value: '?',
        },
        {
          attribute: 'company',
          operator: 'in',
          value: '?',
        },
      ],
    },
    {
      role: 'north',
      effect: 'allow',
      resource: '?',
      scopes: '?',
      id: 2,
      conditions: [
        {
          attribute: 'zone',
          operator: 'in',
          value: ['north'],
        },
      ],
    },
    {
      role: 'south',
      effect: 'allow',
      resource: '?',
      scopes: '?',
      id: 3,
      conditions: [
        {
          attribute: 'zone',
          operator: 'in',
          value: ['south'],
        },
      ],
    },
    {
      role: 'companyA',
      effect: 'allow',
      resource: '?',
      scopes: '?',
      id: 4,
      conditions: [
        {
          attribute: 'company',
          operator: 'in',
          value: ['companyA'],
        },
      ],
    },
    {
      role: 'companyB',
      effect: 'allow',
      resource: '?',
      scopes: '?',
      id: 5,
      conditions: [
        {
          attribute: 'company',
          operator: 'in',
          value: ['companyB'],
        },
      ],
    },
  ];

  const result = authorize(
    ['operator', 'north', 'south', 'companyA', 'companyB'],
    'urn:task',
    'create',
    permissions,
  );

  expect(result.authorized).toBe(true);
  expect(result.conditionAlternatives).toEqual([
    [
      {
        attribute: 'zone',
        operator: 'in',
        value: ['north', 'south'],
        matchingPermissions: [1, 2, 3],
      },
      {
        attribute: 'company',
        operator: 'in',
        value: ['companyA', 'companyB'],
        matchingPermissions: [1, 4, 5],
      },
    ],
  ]);
});

test('User is assigned not to two zones, throws error', () => {
  const permissions: Permission[] = [
    {
      role: 'operator',
      effect: 'allow',
      resource: 'urn:task',
      scopes: ['create'],
      id: 1,
      conditions: [
        {
          attribute: 'zone',
          operator: 'not_equals',
          value: '?',
        },
      ],
    },
    {
      role: 'north',
      effect: 'allow',
      resource: '?',
      scopes: '?',
      id: 2,
      conditions: [
        {
          attribute: 'zone',
          operator: 'not_equals',
          value: 'north',
        },
      ],
    },
    {
      role: 'south',
      effect: 'allow',
      resource: '?',
      scopes: '?',
      id: 2,
      conditions: [
        {
          attribute: 'zone',
          operator: 'not_equals',
          value: 'south',
        },
      ],
    },
  ];

  expect(() => {
    authorize(
      ['operator', 'north', 'south'],
      'urn:task',
      'create',
      permissions,
    );
  }).toThrow();
});

test('User is assigned not to two zones, joins coinditions', () => {
  const permissions: Permission[] = [
    {
      role: 'operator',
      effect: 'allow',
      resource: 'urn:task',
      scopes: ['create'],
      id: 1,
      conditions: [
        {
          attribute: 'zone',
          operator: 'not_in',
          value: '?',
        },
      ],
    },
    {
      role: 'north',
      effect: 'allow',
      resource: '?',
      scopes: '?',
      id: 2,
      conditions: [
        {
          attribute: 'zone',
          operator: 'not_in',
          value: ['north'],
        },
      ],
    },
    {
      role: 'south',
      effect: 'allow',
      resource: '?',
      scopes: '?',
      id: 3,
      conditions: [
        {
          attribute: 'zone',
          operator: 'not_in',
          value: ['south'],
        },
      ],
    },
  ];

  const result = authorize(
    ['operator', 'north', 'south'],
    'urn:task',
    'create',
    permissions,
  );

  expect(result.authorized).toBe(true);
  expect(result.conditionAlternatives).toEqual([
    [
      {
        attribute: 'zone',
        operator: 'not_in',
        value: ['north', 'south'],
        matchingPermissions: [1, 2, 3],
      },
    ],
  ]);
});
