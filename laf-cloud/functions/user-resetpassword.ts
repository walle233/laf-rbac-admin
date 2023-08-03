import cloud from '@lafjs/cloud';

const db = cloud.database();
const checkPermission = cloud.shared.get('checkPermission');
const hashPassword = cloud.shared.get('hashPassword');

export async function main(ctx: FunctionContext) {

  const { headers } = ctx;
  const token = headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) {
    return 'Unauthorized';
  }

  // 权限验证
  const code = await checkPermission(uid, 'user.edit');
  if (code) {
    return { code: '403', error: 'Permission denied' };
  }

  const { _id, username, password } = ctx.body;
  if (!_id || !username || !password)
    return {
      code: 'INVALID_PARAM',
      error: 'username and password and newpassword not be empty',
    };

  const { data: user } = await db
    .collection('user')
    .where({ _id, username })
    .withOne({
      query: db.collection('password').where({ type: 'user' }),
      localField: '_id',
      foreignField: 'uid',
      as: 'password',
    })
    .getOne();


  // update password
  await db
    .collection('password')
    .where({ uid: user._id, type: 'user', status: 'active' })
    .update({
      status: 'inactive',
      updated_at: Date.now(),
    });

  await db.collection('password').add({
    uid: user._id,
    password: hashPassword(password),
    type: 'user',
    status: 'active',
    created_at: Date.now(),
    updated_at: Date.now(),
  });

  return {
    code: 0,
    result: 'success',
  };
}
