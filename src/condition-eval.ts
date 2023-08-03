const operators: {
  [key: string]: (a: string, b: string | string[]) => boolean;
} = {
  equals: (a: string, b: string | string[]): boolean => a == b,
  not_equals: (a: string, b: string | string[]): boolean => a != b,
  in: (a: string, b: string | string[]): boolean => b.includes(a),
  not_in: (a: string, b: string | string[]): boolean => !b.includes(a),
};

export const evalConditions = (
  resourceInstance: any,
  conditionsAlt: ConditionAlternatives,
): boolean => {
  return conditionsAlt.some(conditions => {
    return conditions.every(condition => {
      return operators[condition.operator](
        resourceInstance[condition.attribute],
        condition.value,
      );
    });
  });
};
