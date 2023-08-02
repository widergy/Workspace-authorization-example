interface Condition {
  attribute: string;
  operator: string;
  value: string | object[];
}

type Conditions = Condition[];
type ConditionAlternatives = Conditions[];

export interface Permission {
  resource: string;
  role: string;
  scopes: string[] | string;
  effect: "allow" | "deny";
  conditions: Condition[];
}

interface AuthorizeResponse {
  authorized: boolean;
  conditionAlternatives?: ConditionAlternatives;
}

export const authorize = (
  granted_roles: string[],
  resource: string,
  scope: string,
  permissions: Permission[]
): AuthorizeResponse => {
  const conditionAlternatives: ConditionAlternatives = [];

  const matchingPermissions = permissions.filter((perm) => {
    return (
      granted_roles.includes(perm.role) &&
      (perm.resource == "*" || perm.resource == resource) &&
      (perm.scopes == "*" || perm.scopes.includes(scope))
    );
  });

  const conditionPatterns : Condition[][] = permissions.filter((perm) => {
    return (
      granted_roles.includes(perm.role) &&
      perm.resource == "?" &&
      perm.scopes == "?"
    );
  }).map(perm => perm.conditions);

  const matchPatterns = (condition: Condition) => {
    if (condition.value == '?') {
      for (const conditionPattern of conditionPatterns) {

        const firstConditionOfPattern = conditionPattern[0];

        if (condition.attribute == firstConditionOfPattern.attribute &&
          condition.operator == firstConditionOfPattern.operator) {
            return firstConditionOfPattern
          }
      }
      throw new Error(`Invalid permission assignment: no comparison value for ${condition.attribute}`)
    }
    return condition;
  };

  matchingPermissions.forEach((perm) => {
    if (perm.conditions.length) {
      conditionAlternatives.push(perm.conditions.map(matchPatterns));
    }
  });

  return {
    authorized: matchingPermissions.length != 0,
    ...(conditionAlternatives.length && {
      conditionAlternatives,
    }),
  };
};
