import type {
  JSONAPIDataDocument,
  JSONAPIResourceID,
  JSONAPIResourceRelationship,
  JSONAPIResourceRelationship0,
  JSONAPIResourceRelationship1,
  JSONAPIResourceRelationshipN,
  JSONAPIServerResource,
} from './types';

test('resource ID definition', () => {
  type PetID = JSONAPIResourceID<'pets'>;

  const petId: PetID = { type: 'pets', id: 'nickel' };
  let anyId: JSONAPIResourceID = petId;

  anyId = { type: 'people', id: 'joe' };

  expect(anyId).toBeTruthy();
  expect(petId.type).toBe('pets');

  // the following code must not transpile
  // petId = { type: 'people', id: 'dime' };
  // petId = anyId
});

test('resource relationship definitions', () => {
  type ID = JSONAPIResourceID<'pets'>;
  type Rel0 = JSONAPIResourceRelationship0<'pets'>;
  type Rel1 = JSONAPIResourceRelationship1<'pets'>;
  type RelN = JSONAPIResourceRelationshipN<'pets'>;
  type Rel = JSONAPIResourceRelationship<'pets'>;

  let rel0: Rel0 = { data: null };
  rel0 = { data: { type: 'pets', id: '12' } };
  // the following code must not transpile
  // rel0 = { data: [{ type: 'pets', id: '1' }] };
  expect(rel0).toBeTruthy();

  const rel1: Rel1 = { data: { type: 'pets', id: '1' } };
  // the following code must not transpile
  // rel1 = { data: null };
  // rel1 = { data: [{ type: 'pets', id: '1' }] };
  expect(rel1).toBeTruthy();

  let relN: RelN = { data: [] as ID[] };
  relN = {
    data: [
      { type: 'pets', id: '12' },
      { type: 'pets', id: '23' },
    ],
  };
  // the following code must not transpile
  // relN = { data: null };
  // relN = { data: { type: 'pets', id: '1' } };
  // relN = { data: { type: 'not-pets', id: '1' } };

  let rel: Rel = { data: null };
  rel = rel0;
  rel = rel1;
  rel = relN;
  expect(rel).toBeTruthy();
});

test('generic resource definitions can describe any resource', () => {
  type AnyResource = JSONAPIServerResource;
  let anyRes: AnyResource = {
    type: 'any',
    id: '1',
    attributes: { x: '1' },
    relationships: { x: { data: null } },
  };
  expect(anyRes.attributes.x).toBe('1');
  expect(anyRes.attributes.y).toBeUndefined();

  anyRes = { type: 'some', id: '12', attributes: {} };
  expect(anyRes.attributes.x).toBeUndefined();

  expect(anyRes).toBeTruthy();
});

test('specific server resource definition', () => {
  type ShelterResource = JSONAPIServerResource<
    'shelter',
    {
      name: string;
      open: boolean;
    }
  >;

  const shelter: ShelterResource = {
    type: 'shelter',
    id: '12',
    attributes: { name: 'Tymmczasy', open: true },
  };
  expect(shelter).toBeTruthy();

  // the following code will not transpile
  // shelter = { type: 'x', id: '1', attributes: { name: 'Tymmczasy', open: true }, };
  // shelter = { type: 'shelter', id: 'tymmczasy', attributes: {}, };

  const anyResource: JSONAPIServerResource = shelter;
  expect(anyResource).toBeTruthy();
});

test('data documents', () => {
  type PersonType = 'people';
  type Person = JSONAPIServerResource<PersonType, { name: string }>;

  type PetType = 'pets';
  type Pet = JSONAPIServerResource<
    PetType,
    {
      name: string;
    },
    {
      owner: JSONAPIResourceRelationship0<PersonType>;
      shelter?: JSONAPIResourceRelationship1<ShelterType>;
    }
  >;

  type ShelterType = 'shelters';
  type Shelter = JSONAPIServerResource<
    ShelterType,
    {
      name: string;
    },
    {
      pets: JSONAPIResourceRelationshipN<PetType>;
    }
  >;

  type ShelterListResponse = JSONAPIDataDocument<Shelter, Pet | Person>;

  const response: ShelterListResponse = {
    jsonapi: { version: '1.0' },
    data: {
      type: 'shelters',
      id: '12',
      attributes: {
        name: 'Tymmczasy',
      },
      relationships: {
        pets: {
          data: [
            { type: 'pets', id: 'ryszard' },
            { type: 'pets', id: 'samurai' },
          ],
        },
      },
    },
    included: [
      {
        type: 'pets',
        id: 'ryszard',
        attributes: { name: 'Ryszard Kocie Serce' },
        relationships: {
          owner: { data: { type: 'people', id: 'andriy' } },
          shelter: { data: { type: 'shelters', id: '12' } },
        },
      },
      {
        type: 'pets',
        id: 'samurai',
        attributes: { name: 'Samurai' },
        relationships: { owner: { data: null } },
      },
      { type: 'people', id: 'andriy', attributes: { name: 'Andriy' } },
    ],
  };
  expect(response).toBeTruthy();
});
