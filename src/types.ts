interface Condition {
  attribute: string;
  operator: string;
  value: string | string[];
  matchingPermissions?: number[];
}

type Conditions = Condition[];
type ConditionAlternatives = Conditions[];
