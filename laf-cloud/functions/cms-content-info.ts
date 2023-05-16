import cloud from '@lafjs/cloud';

const db = cloud.database();

export async function main(ctx: FunctionContext) {
  // check permission
  const token = ctx.headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) return { code: 'NO_AUTH', error: 'permission denied' };

  const { body } = ctx;
  const { schemaId, _id } = body;

  if (!schemaId || !_id) {
    return { code: 'INVALID_PARAM', error: 'schemaId or id cannot be empty' };
  }

  // get schema
  const { data: schema } = await db.collection('schema').doc(schemaId).get();

  if (!schema) return 'Schema is not exit';

  const collection = schema.collectionName;

  // check id
  const { data } = await db.collection(collection).doc(_id).get();
  if (!data) {
    return { code: 'INVALID_PARAM', error: 'not exists' };
  }

  return {
    code: 0,
    result: data,
  };
}
