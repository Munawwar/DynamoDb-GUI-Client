import { FilterCondition, LogicalOperator } from './types';

export interface FilterExpressionResult {
  FilterExpression: string;
  ExpressionAttributeNames: { [key: string]: string };
  ExpressionAttributeValues: { [key: string]: any };
}

function normalizeExpr(expr: string): string {
  return expr === '!=' ? '<>' : expr;
}

function coerceValue(value: any, valueType: string): any {
  switch (valueType) {
    case 'number': return Number(value);
    case 'boolean': return value === true || value === 'true';
    case 'null': return null;
    default: return value != null ? value.toString() : '';
  }
}

function isWordExpression(expr: string): boolean {
  return /^[a-z]/i.test(expr);
}

export function buildSingleFilter(
  condition: FilterCondition,
  index: number,
): FilterExpressionResult {
  const nameAlias = `#col${index}`;
  const valueAlias = `:val${index}`;
  const expr = normalizeExpr(condition.expr);

  const fragment = isWordExpression(expr)
    ? `${expr}(${nameAlias}, ${valueAlias})`
    : `${nameAlias} ${expr} ${valueAlias}`;

  return {
    FilterExpression: fragment,
    ExpressionAttributeNames: { [nameAlias]: condition.column },
    ExpressionAttributeValues: { [valueAlias]: coerceValue(condition.value, condition.valueType) },
  };
}

export function buildFilterExpression(
  conditions: FilterCondition[],
  logicalOperator: LogicalOperator,
): FilterExpressionResult | undefined {
  if (!conditions.length) {
    return undefined;
  }

  const parts = conditions.map((c, i) => buildSingleFilter(c, i));

  return {
    FilterExpression: parts.map((p) => p.FilterExpression).join(` ${logicalOperator} `),
    ExpressionAttributeNames: Object.assign({}, ...parts.map((p) => p.ExpressionAttributeNames)),
    ExpressionAttributeValues: Object.assign({}, ...parts.map((p) => p.ExpressionAttributeValues)),
  };
}

export function buildLegacyFilter(
  filterColumn: string,
  filterExpr: string,
  filterValue: any,
): FilterExpressionResult {
  return buildSingleFilter(
    { column: filterColumn, expr: filterExpr, value: filterValue, valueType: typeof filterValue },
    0,
  );
}
