import cloud from '@lafjs/cloud';

const db = cloud.database();

export async function main(ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { body } = ctx;
  const token = ctx.headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) return { code: 'NO_AUTH', error: 'permission denied' };

  const { schemaId, _id } = body;
  if (!schemaId || !_id) {
    return { code: 'INVALID_PARAM', error: 'id cannot be empty' };
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

  // 数据库操作
  const r = await db.collection(collection).doc(_id).remove();

  return {
    code: 0,
    result: r,
  };
}
