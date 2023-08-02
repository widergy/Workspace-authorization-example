interface Condition {
  attribute: string;
  operator: string;
  value: string | object[];
}

type Conditions = Condition[];
type ConditionAlternatives = Conditions[];

type Permission = object;

interface AuthorizeResponse {
    authorized: boolean,
    conditionAlternatives?: ConditionAlternatives
}


/**
 * 
 * Precondition: the scope is related to the resource.
 * 
 * @param granted_roles
 * @param resource
 * @param scope 
 * @param permissions 
 * @returns 
 */
export const authorize = (
  granted_roles: string[],
  resource: string,
  scope: string,
  permissions: Permission[]
): AuthorizeResponse => {
  return {
  };
};
