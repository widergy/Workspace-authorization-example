import { evalConditions } from '../condition-eval';

test('eval single alternative equal condition', () => {
  const resourceInstance = {
    companyName: 'MyCompanySRL',
  };

  const conditionAlternatives: ConditionAlternatives = [
    [
      {
        attribute: 'companyName',
        operator: 'equals',
        value: 'MyCompanySRL',
      },
    ],
  ];

  const result = evalConditions(resourceInstance, conditionAlternatives);

  expect(result).toBe(true);
});

test("eval single alternative equal condition, doesn't match", () => {
  const resourceInstance = {
    companyName: 'MyOtherCompanySRL',
  };

  const conditionAlternatives: ConditionAlternatives = [
    [
      {
        attribute: 'companyName',
        operator: 'equals',
        value: 'MyCompanySRL',
      },
    ],
  ];

  const result = evalConditions(resourceInstance, conditionAlternatives);

  expect(result).toBe(false);
});

test('eval multiple alternatives equal condition', () => {
  const resourceInstance = {
    companyName: 'MyOtherCompanySRL',
  };

  const conditionAlternatives: ConditionAlternatives = [
    [
      {
        attribute: 'companyName',
        operator: 'equals',
        value: 'MyCompanySRL',
      },
    ],
    [
      {
        attribute: 'companyName',
        operator: 'equals',
        value: 'MyOtherCompanySRL',
      },
    ],
  ];

  const result = evalConditions(resourceInstance, conditionAlternatives);

  expect(result).toBe(true);
});

test('eval complex conditions, attribute missing', () => {
  const resourceInstance = {
    companyName: 'MyCompanySRL',
    zone: 'South',
  };

  const conditionAlternatives: ConditionAlternatives = [
    [
      {
        attribute: 'companyName',
        operator: 'equals',
        value: 'MyCompanySRL',
      },
      {
        attribute: 'zone',
        operator: 'equals',
        value: 'North',
      },
    ],
  ];

  const result = evalConditions(resourceInstance, conditionAlternatives);

  expect(result).toBe(false);
});

test('eval complex conditions, all attribute match', () => {
  const resourceInstance = {
    companyName: 'MyCompanySRL',
    zone: 'North',
  };

  const conditionAlternatives: ConditionAlternatives = [
    [
      {
        attribute: 'companyName',
        operator: 'equals',
        value: 'MyCompanySRL',
      },
      {
        attribute: 'zone',
        operator: 'equals',
        value: 'North',
      },
    ],
  ];

  const result = evalConditions(resourceInstance, conditionAlternatives);

  expect(result).toBe(true);
});

test('in operator', () => {
  const resourceInstance = {
    companyName: 'MyCompanySRL',
  };

  const conditionAlternatives: ConditionAlternatives = [
    [
      {
        attribute: 'companyName',
        operator: 'in',
        value: ['MyOtherCompany', 'MyCompanySRL'],
      },
    ],
  ];

  const result = evalConditions(resourceInstance, conditionAlternatives);

  expect(result).toBe(true);
});

test('not_in operator', () => {
  const resourceInstance = {
    companyName: 'MyCompanySRL',
  };

  const conditionAlternatives: ConditionAlternatives = [
    [
      {
        attribute: 'companyName',
        operator: 'not_in',
        value: ['MyOtherCompany', 'MyCompanySRL'],
      },
    ],
  ];

  const result = evalConditions(resourceInstance, conditionAlternatives);

  expect(result).toBe(false);
});

test('not_equals operator', () => {
  const resourceInstance = {
    companyName: 'MyOtherCompanySRL',
  };

  const conditionAlternatives: ConditionAlternatives = [
    [
      {
        attribute: 'companyName',
        operator: 'not_equals',
        value: 'MyCompanySRL',
      },
    ],
  ];

  const result = evalConditions(resourceInstance, conditionAlternatives);

  expect(result).toBe(true);
});


test('empty condition', () => {
  const resourceInstance = {
    companyName: 'MyOtherCompanySRL',
  };

  const conditionAlternatives: ConditionAlternatives = [
    [],
    [{
      "attribute": "companyName",
      "operator": "equals",
      "value": "otherValue"
    }]
  ];

  const result = evalConditions(resourceInstance, conditionAlternatives);

  expect(result).toBe(true);
});

test('eval complex conditions, two clauses', () => {
  const resourceInstance = {
    companyName: 'companyA',
    zone: 'South',
  };

  const conditionAlternatives: ConditionAlternatives = [
    [
      {
        attribute: 'companyName',
        operator: 'equals',
        value: 'MyCompanySRL',
      },
      {
        attribute: 'zone',
        operator: 'equals',
        value: 'North',
      },
    ],
    [
      {
        attribute: 'companyName',
        operator: 'in',
        value: ['companyA', 'companyB'] ,
      },
      {
        attribute: 'zone',
        operator: 'equals',
        value: 'South',
      },
    ],
  ];

  const result = evalConditions(resourceInstance, conditionAlternatives);

  expect(result).toBe(true);
});
