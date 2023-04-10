import cloud from '@lafjs/cloud';

const checkPermission = cloud.shared.get('checkPermission');

export async function main(ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { body, query, headers } = ctx;

  const token = headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) return { code: '401', error: '未授权访问' };

  // checkPermission
  const code = await checkPermission(uid, 'admin.read');
  if (code) {
    return 'Permission denied';
  }

  const { page, pageSize } = body;

  // 数据库操作
  const db = cloud.database();
  const { total } = await db.collection('admin').count();

  const skip = page === 0 ? 0 : page - 1;
  const r = await db
    .collection('admin')
    .skip(skip * pageSize)
    .limit(pageSize)
    .get();

  return {
    code: 0,
    result: {
      list: r.data.map((_) => {
        Reflect.deleteProperty(_, 'password');
        return _;
      }),
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
    },
  };
}
