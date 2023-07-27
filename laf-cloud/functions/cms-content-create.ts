import cloud from '@lafjs/cloud';
const db = cloud.database();

export async function main(ctx: FunctionContext) {
  const { headers, body } = ctx;
  const { schemaId, params } = body;

  const token = headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) {
    return 'Unauthorized';
  }

  // check params
  if (!schemaId || !params) {
    return 'Invalid params';
  }

  // get schema
  const { data: schema } = await db.collection('schema').where(
    db.command.or({ _id: schemaId }, { collectionName: schemaId })
  ).getOne();

  if (!schema) return 'Schema is not exit';

  const collection = schema.collectionName;

  const r = await db.collection(collection).add({
    ...params,
    created_at: Date.now(),
    updated_at: Date.now(),
  });

  return {
    code: 0,
    result: r,
  };
}
