import { describe, expect, it } from 'vitest';
import { validateDto } from '../../../test/fixtures/validation.js';
import { SearchRidesQueryDto } from './types.js';

describe('SearchRidesQueryDto', () => {
  const valid = {
    originCityId: '1',
    destinationCityId: '2',
    date: '2026-11-12',
  };

  it('converts query-string ids to numbers', async () => {
    const { dto, errors } = await validateDto(SearchRidesQueryDto, valid);

    expect(errors).toEqual([]);
    expect(dto.originCityId).toBe(1);
    expect(dto.destinationCityId).toBe(2);
  });

  it.each([
    ['a missing origin', { originCityId: undefined }, 'originCityId'],
    [
      'a non-numeric destination',
      { destinationCityId: 'abc' },
      'destinationCityId',
    ],
    ['an impossible date', { date: '2026-02-30' }, 'date'],
    ['a date with a time', { date: '2026-11-12T10:00' }, 'date'],
    ['a non-ISO date', { date: '12/11/2026' }, 'date'],
  ])('rejects %s', async (_case, override, field) => {
    const { errors } = await validateDto(SearchRidesQueryDto, {
      ...valid,
      ...override,
    });

    expect(new Set(errors)).toEqual(new Set([field]));
  });
});
