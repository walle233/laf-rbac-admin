import cloud from '@lafjs/cloud';

const db = cloud.database();


export async function main(ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { body, headers } = ctx;
  let { schemaId, page, pageSize, filters } = body;

  const token = headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) return { code: '401', error: '未授权访问' };

  // get schema
  const { data: schema } = await db.collection('schema').where(
    db.command.or({ _id: schemaId }, { collectionName: schemaId })
  ).getOne();

  if (!schema) return 'Schema is not exit';

  const collection = schema.collectionName;

  const { total } = await db.collection(collection).count();

  const skip = page === 0 ? 0 : page - 1;

  const relations = [];
  for (const field of schema.fields) {
    if (field.type == 'Connect') {
      relations.push({
        query: db.collection(field.connectCollection),
        localField: field.name, // 主表连接键，即 article.id
        foreignField: '_id', // 子表连接键，即 tag.article_id
        as: `relation-${field.connectCollection}`, // 查询结果中字段重命名，缺省为子表名
      });
    }
  }

  const where = {};
  for (const key in filters) {
    if (filters[key]) {
      try {
        where[key] = new RegExp(`${filters[key]}`);
      } catch (err) { }
    }
  }

  let query = db
    .collection(collection)
    .where(db.command.and(where))
    .skip(skip * pageSize)
    .limit(pageSize);
  for (const relation of relations) {
    query = query.withOne(relation);
  }
  const r = await query.get();

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
