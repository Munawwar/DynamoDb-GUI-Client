import { buildSingleFilter, buildFilterExpression } from '@/store/modules/records/filterExpression';
import { isConditionValid } from '@/store/modules/records/getters';
import { FilterCondition } from '@/store/modules/records/types';

describe('buildSingleFilter', () => {
  test('builds operator-based expression with indexed aliases', () => {
    const condition: FilterCondition = {
      column: 'age',
      expr: '>=',
      value: '25',
      valueType: 'number',
    };
    const result = buildSingleFilter(condition, 0);
    expect(result.FilterExpression).toBe('#col0 >= :val0');
    expect(result.ExpressionAttributeNames).toEqual({ '#col0': 'age' });
    expect(result.ExpressionAttributeValues).toEqual({ ':val0': 25 });
  });

  test('builds word-based expression (begins_with)', () => {
    const condition: FilterCondition = {
      column: 'name',
      expr: 'begins_with',
      value: 'Jo',
      valueType: 'string',
    };
    const result = buildSingleFilter(condition, 1);
    expect(result.FilterExpression).toBe('begins_with(#col1, :val1)');
    expect(result.ExpressionAttributeNames).toEqual({ '#col1': 'name' });
    expect(result.ExpressionAttributeValues).toEqual({ ':val1': 'Jo' });
  });

  test('builds contains expression', () => {
    const condition: FilterCondition = {
      column: 'email',
      expr: 'contains',
      value: '@test',
      valueType: 'string',
    };
    const result = buildSingleFilter(condition, 2);
    expect(result.FilterExpression).toBe('contains(#col2, :val2)');
  });

  test('converts != to <>', () => {
    const condition: FilterCondition = {
      column: 'status',
      expr: '!=',
      value: 'active',
      valueType: 'string',
    };
    const result = buildSingleFilter(condition, 0);
    expect(result.FilterExpression).toBe('#col0 <> :val0');
  });

  test('handles null valueType', () => {
    const condition: FilterCondition = {
      column: 'deletedAt',
      expr: '=',
      value: null,
      valueType: 'null',
    };
    const result = buildSingleFilter(condition, 0);
    expect(result.ExpressionAttributeValues).toEqual({ ':val0': null });
  });

  test('handles boolean valueType', () => {
    const condition: FilterCondition = {
      column: 'active',
      expr: '=',
      value: true,
      valueType: 'boolean',
    };
    const result = buildSingleFilter(condition, 0);
    expect(result.ExpressionAttributeValues).toEqual({ ':val0': true });
  });

  test('coerces boolean string "true" to true', () => {
    const condition: FilterCondition = {
      column: 'active',
      expr: '=',
      value: 'true',
      valueType: 'boolean',
    };
    const result = buildSingleFilter(condition, 0);
    expect(result.ExpressionAttributeValues).toEqual({ ':val0': true });
  });
});

describe('buildFilterExpression', () => {
  test('returns undefined for empty conditions', () => {
    expect(buildFilterExpression([], 'AND')).toBeUndefined();
  });

  test('single condition produces no logical operator', () => {
    const conditions: FilterCondition[] = [
      { column: 'age', expr: '>', value: '18', valueType: 'number' },
    ];
    const result = buildFilterExpression(conditions, 'AND')!;
    expect(result.FilterExpression).toBe('#col0 > :val0');
    expect(result.ExpressionAttributeNames).toEqual({ '#col0': 'age' });
    expect(result.ExpressionAttributeValues).toEqual({ ':val0': 18 });
  });

  test('multiple conditions joined with AND', () => {
    const conditions: FilterCondition[] = [
      { column: 'age', expr: '>=', value: '18', valueType: 'number' },
      { column: 'status', expr: '=', value: 'active', valueType: 'string' },
    ];
    const result = buildFilterExpression(conditions, 'AND')!;
    expect(result.FilterExpression).toBe('#col0 >= :val0 AND #col1 = :val1');
    expect(result.ExpressionAttributeNames).toEqual({ '#col0': 'age', '#col1': 'status' });
    expect(result.ExpressionAttributeValues).toEqual({ ':val0': 18, ':val1': 'active' });
  });

  test('multiple conditions joined with OR', () => {
    const conditions: FilterCondition[] = [
      { column: 'role', expr: '=', value: 'admin', valueType: 'string' },
      { column: 'role', expr: '=', value: 'superadmin', valueType: 'string' },
    ];
    const result = buildFilterExpression(conditions, 'OR')!;
    expect(result.FilterExpression).toBe('#col0 = :val0 OR #col1 = :val1');
    // Same column name but different aliases - no collision
    expect(result.ExpressionAttributeNames['#col0']).toBe('role');
    expect(result.ExpressionAttributeNames['#col1']).toBe('role');
    expect(result.ExpressionAttributeValues[':val0']).toBe('admin');
    expect(result.ExpressionAttributeValues[':val1']).toBe('superadmin');
  });

  test('three conditions with mixed expression types', () => {
    const conditions: FilterCondition[] = [
      { column: 'age', expr: '>=', value: '21', valueType: 'number' },
      { column: 'name', expr: 'begins_with', value: 'A', valueType: 'string' },
      { column: 'active', expr: '=', value: true, valueType: 'boolean' },
    ];
    const result = buildFilterExpression(conditions, 'AND')!;
    expect(result.FilterExpression).toBe(
      '#col0 >= :val0 AND begins_with(#col1, :val1) AND #col2 = :val2',
    );
    expect(Object.keys(result.ExpressionAttributeNames)).toHaveLength(3);
    expect(Object.keys(result.ExpressionAttributeValues)).toHaveLength(3);
  });

  test('not contains expression', () => {
    const conditions: FilterCondition[] = [
      { column: 'email', expr: 'not contains', value: 'spam', valueType: 'string' },
    ];
    const result = buildFilterExpression(conditions, 'AND')!;
    expect(result.FilterExpression).toBe('not contains(#col0, :val0)');
  });
});

describe('isConditionValid', () => {
  test('invalid when column is empty', () => {
    expect(isConditionValid({ column: '', expr: '=', value: 'x', valueType: 'string' })).toBe(false);
  });

  test('invalid when expr is empty', () => {
    expect(isConditionValid({ column: 'a', expr: '', value: 'x', valueType: 'string' })).toBe(false);
  });

  test('invalid when valueType is empty', () => {
    expect(isConditionValid({ column: 'a', expr: '=', value: 'x', valueType: '' })).toBe(false);
  });

  test('null type is always valid (no value needed)', () => {
    expect(isConditionValid({ column: 'a', expr: '=', value: null, valueType: 'null' })).toBe(true);
  });

  test('boolean type requires boolean value', () => {
    expect(isConditionValid({ column: 'a', expr: '=', value: true, valueType: 'boolean' })).toBe(true);
    expect(isConditionValid({ column: 'a', expr: '=', value: 'true', valueType: 'boolean' })).toBe(false);
  });

  test('number type requires finite number', () => {
    expect(isConditionValid({ column: 'a', expr: '=', value: '42', valueType: 'number' })).toBe(true);
    expect(isConditionValid({ column: 'a', expr: '=', value: '', valueType: 'number' })).toBe(false);
    expect(isConditionValid({ column: 'a', expr: '=', value: 'abc', valueType: 'number' })).toBe(false);
  });

  test('string type requires non-empty string', () => {
    expect(isConditionValid({ column: 'a', expr: '=', value: 'hello', valueType: 'string' })).toBe(true);
    expect(isConditionValid({ column: 'a', expr: '=', value: '', valueType: 'string' })).toBe(false);
  });
});
