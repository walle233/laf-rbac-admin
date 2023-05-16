import cloud from '@lafjs/cloud';

const db = cloud.database();

export async function main(ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { body, headers } = ctx;
  const { schemaId, page, pageSize } = body;

  const token = headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) return { code: '401', error: '未授权访问' };

  // get schema
  const { data: schema } = await db.collection('schema').doc(schemaId).get();

  if (!schema) return 'Schema is not exit';

  const collection = schema.collectionName;

  const { total } = await db.collection(collection).count();

  const skip = page === 0 ? 0 : page - 1;
  const r = await db
    .collection(collection)
    .skip(skip * pageSize)
    .limit(pageSize)
    .get();

  return {
    code: 0,
    result: {
      list: r.data,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
    },
  };
}
