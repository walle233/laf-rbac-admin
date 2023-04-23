import cloud from '@lafjs/cloud';

const db = cloud.database();
const hashPassword = cloud.shared.get('hashPassword');

export async function main(ctx: FunctionContext) {
  const { username, password, newpassword } = ctx.body;
  if (!username || !password || !newpassword)
    return {
      code: 'INVALID_PARAM',
      error: 'username and password and newpassword not be empty',
    };

  const { data: admin } = await db
    .collection('admin')
    .where({ username })
    .withOne({
      query: db.collection('password').where({ type: 'login' }),
      localField: '_id',
      foreignField: 'uid',
      as: 'password',
    })
    .getOne();

  // check username and password
  const isMatchPassword = admin.password?.password === hashPassword(password);
  if (!admin || !isMatchPassword) return { code: 'INVALID_PARAM', error: '账号或密码错误' };

  // update password
  await db
    .collection('password')
    .where({ uid: admin._id, type: 'login', password: hashPassword(password) })
    .update({
      status: 'inactive',
      updated_at: Date.now(),
    });

  await db.collection('password').add({
    uid: admin.id,
    password: hashPassword(password),
    type: 'login',
    status: 'active',
    created_at: Date.now(),
    updated_at: Date.now(),
  });

  return {
    code: 0,
    result: 'success',
  };
}
