import cloud from '@lafjs/cloud';

const db = cloud.database();
const checkPermission = cloud.shared.get('checkPermission');

export async function main(ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { body, headers } = ctx;

  const token = headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) return { code: '401', error: '未授权访问' };

  // checkPermission
  const code = await checkPermission(uid, 'schema.read');
  if (code) {
    return 'Permission denied';
  }

  const { page, pageSize } = body;

  const { total } = await db.collection('schema').count();

  const skip = page === 0 ? 0 : page - 1;
  const r = await db
    .collection('schema')
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
