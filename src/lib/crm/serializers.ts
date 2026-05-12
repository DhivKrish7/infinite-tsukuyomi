type TagJoin = {
  tag: {
    id: string;
    name: string;
    color: string;
  };
};

export function serializeTags(tags: TagJoin[]) {
  return tags.map(({ tag }) => tag);
}

export function toNullableDate(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return new Date(value);
}

export function tagCreateInput(tenantId: string, tags: string[]) {
  return tags.map((name) => ({
    tag: {
      connectOrCreate: {
        where: {
          tenantId_name: {
            tenantId,
            name
          }
        },
        create: {
          tenantId,
          name
        }
      }
    }
  }));
}
