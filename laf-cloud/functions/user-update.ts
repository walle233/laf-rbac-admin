import cloud from '@lafjs/cloud';
const db = cloud.database();
const shared = cloud.shared;

const checkPermission = shared.get('checkPermission');
const hashPassword = shared.get('hashPassword');

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

  // 参数验证
  const { _id, username, password, avatar, nickname, phone, email } = ctx.body;
  if (!_id) {
    return { code: 'INVALID_PARAM', error: 'user id cannot be empty' };
  }

  // 验证 user _id 是否合法
  const { data: user } = await db.collection('user').where({ _id: _id }).getOne();
  if (!user) {
    return { code: 'INVALID_PARAM', error: 'user not exists' };
  }

  const old = user;

  // update user
  const data = { updated_at: Date.now() };

  // update password
  if (password) {
    data['password'] = hashPassword(password);
  }

  // username
  if (username && username != old.username) {
    const { total } = await db.collection('user').where({ username }).count();
    if (total) return { code: 'INVALID_PARAM', error: 'username already exists' };
    data['username'] = username;
  }

  // name
  if (nickname && nickname != old.nickname) {
    const { total } = await db.collection('user').where({ nickname }).count();
    if (total) return { code: 'INVALID_PARAM', error: 'nickname already exists' };
    data['nickname'] = nickname;
  }

  // avatar
  if (avatar && avatar != old.avatar) {
    data['avatar'] = avatar;
  }

  // phone
  if (phone && phone != old.phone) {
    data['phone'] = phone;
  }

  // email
  if (phone && email != old.email) {
    data['email'] = phone;
  }

  const r = await db
    .collection('user')
    .where({ _id: _id })
    .update({
      ...data,
      updated_at: Date.now(),
    });

  return {
    code: 0,
    result: { ...r, _id },
  };
}
