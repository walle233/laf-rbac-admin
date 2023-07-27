import cloud from '@lafjs/cloud';
const db = cloud.database();

export async function main(ctx: FunctionContext) {
  const { headers } = ctx;
  const { schemaId, _id, params } = ctx.body;

  const token = headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) {
    return 'Unauthorized';
  }

  if (!schemaId || !_id) {
    return 'collection or _id cannot be empty';
  }

  // get schema
  const { data: schema } = await db.collection('schema').where(
    db.command.or({ _id: schemaId }, { collectionName: schemaId })
  ).getOne();

  if (!schema) return 'Schema is not exit';

  const collection = schema.collectionName;

  // check id
  const { data } = await db.collection(collection).where({ _id }).getOne();
  if (!data) {
    return { code: 'INVALID_PARAM', error: 'not exists' };
  }

  // update
  const r = await db
    .collection(collection)
    .where({ _id })
    .update({
      ...params,
      updated_at: Date.now(),
    });

  return {
    code: 0,
    result: r,
  };
}
