import cloud from '@lafjs/cloud';

const db = cloud.database();
const hashPassword = cloud.shared.get('hashPassword');

export async function main(ctx: FunctionContext) {
  const { username, password } = ctx.body;
  if (!username || !password) return { code: 'INVALID_PARAM', error: '账号和密码不可为空' };

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

  // 默认 token 有效期为 7 天
  const expire = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  const payload = {
    uid: admin._id,
    type: 'admin',
    exp: expire,
  };

  const access_token = cloud.getToken(payload);
  return {
    code: 0,
    data: {
      access_token,
      uid: admin._id,
      expire,
    },
  };
}
