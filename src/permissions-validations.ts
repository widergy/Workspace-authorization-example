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

  const conditionPatterns: Condition[][] = permissions
    .filter(perm => {
      return (
        granted_roles.includes(perm.role) &&
        perm.resource == '?' &&
        perm.scopes == '?'
      );
    })
    .map(perm =>
      perm.conditions.map(c => ({ ...c, matchingPermissions: [perm.id] })),
    );

  const matchPatterns =
    (permId: number) =>
    (condition: Condition): Condition => {
      if (condition.value == '?') {
        for (const conditionPattern of conditionPatterns) {
          assertPatternHasOnlyOneCondition(conditionPattern);
          const firstConditionOfPattern = conditionPattern[0];

          if (
            condition.attribute == firstConditionOfPattern.attribute &&
            condition.operator == firstConditionOfPattern.operator
          ) {
            firstConditionOfPattern.matchingPermissions!.push(permId);
            return firstConditionOfPattern;
          }
        }
        throw new Error(
          `Invalid permission assignment: no comparison value for ${condition.attribute}`,
        );
      }
      return { ...condition, matchingPermissions: [permId] };
    };

  const authorized =
    matchingPermissions.length > 0 &&
    matchingPermissions.every(perm => {
      if (perm.effect == 'deny') {
        return false;
      }
      if (perm.conditions.length) {
        conditionAlternatives.push(perm.conditions.map(matchPatterns(perm.id)));
      }
      return true;
    });

  return {
    authorized,
    ...(conditionAlternatives.length && {
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
