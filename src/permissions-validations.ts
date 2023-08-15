export interface Permission {
  id: number;
  resource: string | '*' | '?';
  role: string;
  scopes: string[] | '*' | '?';
  effect: 'allow' | 'deny';
  conditions: Condition[];
}

interface AuthorizeResponse {
  authorized: boolean;
  conditionAlternatives?: ConditionAlternatives;
  matchingPermissions?: number[];
}

export const authorize = (
  granted_roles: string[],
  resource: string,
  scope: string,
  permissions: Permission[],
): AuthorizeResponse => {
  const conditionAlternatives: ConditionAlternatives = [];

  const matchingPermissions = permissions.filter(perm => {
    return (
      granted_roles.includes(perm.role) &&
      (perm.resource == '*' || perm.resource == resource) &&
      (perm.scopes == '*' || perm.scopes.includes(scope))
    );
  });

  const conditionPatterns: Condition[] = permissions
    .filter(perm => {
      return (
        granted_roles.includes(perm.role) &&
        perm.resource == '?' &&
        perm.scopes == '?'
      );
    })
    .map(perm => {
      assertPatternHasOnlyOneCondition(perm.conditions);
      const conditionPattern = perm.conditions[0];

      return { ...conditionPattern, matchingPermissions: [perm.id] };
    });

  const matchPatterns =
    (permId: number) =>
    (condition: Condition): Condition => {
      if (condition.value == '?') {
        const matchingConditions = conditionPatterns.filter(pattern => {
          return (
            condition.attribute == pattern.attribute &&
            condition.operator == pattern.operator
          );
        });

        if (matchingConditions.length == 0) {
          throw new Error(
            `Invalid permission assignment: no comparison value for ${condition.attribute}`,
          );
        }

        if (
          ['equals', 'not_equals'].includes(condition.operator) &&
          matchingConditions.length > 1
        ) {
          throw new Error(
            'Invalid permissions assignment: equals matches multiple values',
          );
        }

        if (['in', 'not_in'].includes(condition.operator)) {
          let newValue: string[] = [];
          const newPermissions: number[] = [permId];
          matchingConditions.forEach(cond => {
            newValue = [...newValue, ...cond.value];
            newPermissions.push(cond.matchingPermissions?.[0] || -1);
          });

          return {
            ...matchingConditions[0],
            value: newValue,
            matchingPermissions: newPermissions,
          };
        }

        matchingConditions[0].matchingPermissions?.push(permId);
        return matchingConditions[0];
      }
      return { ...condition, matchingPermissions: [permId] };
    };

  const authorized =
    matchingPermissions.length > 0 &&
    matchingPermissions.every(perm => {
      if (perm.effect == 'deny') {
        return false;
      }

      conditionAlternatives.push(perm.conditions.map(matchPatterns(perm.id)));

      return true;
    });

  const thereIsAnEmptyCondition = conditionAlternatives.some(
    e => e.length == 0,
  );
  return {
    authorized,
    ...(!thereIsAnEmptyCondition &&
      matchingPermissions.length != 0 && {
        conditionAlternatives,
      }),
    matchingPermissions: matchingPermissions.map(p => p.id),
  };
};

const assertPatternHasOnlyOneCondition = (pattern: Conditions) => {
  if (pattern.length > 1) {
    throw new Error(
      'Conditioning pattern permissions should have a single condition',
    );
  }
};
