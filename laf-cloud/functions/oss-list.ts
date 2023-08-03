import cloud from '@lafjs/cloud'

const db = cloud.database();
const checkPermission = cloud.shared.get('checkPermission');

export default async function (ctx: FunctionContext) {
  const { body, query, headers } = ctx;

  const token = headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) return { code: '401', error: '未授权访问' };

  // checkPermission
  const code = await checkPermission(uid, 'oss.manager.read');
  if (code) {
    return 'Permission denied';
  }

  const { page, pageSize } = body;

  // 数据库操作
  const db = cloud.database();
  const { total } = await db.collection('oss-manager').count();

  const skip = page === 0 ? 0 : page - 1;
  const r = await db
    .collection('oss-manager')
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