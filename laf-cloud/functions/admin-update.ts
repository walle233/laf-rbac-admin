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
  const code = await checkPermission(uid, 'admin.edit');
  if (code) {
    return { code: '403', error: 'Permission denied' };
  }

  // 参数验证
  const { _id, username, password, avatar, name, roles } = ctx.body;
  if (!_id) {
    return { code: 'INVALID_PARAM', error: 'admin id cannot be empty' };
  }

  // 验证 user _id 是否合法
  const { data: admin } = await db.collection('admin').where({ _id: _id }).getOne();
  if (!admin) {
    return { code: 'INVALID_PARAM', error: 'user not exists' };
  }

  // 验证 roles 是否合法
  const { total: valid_count } = await db
    .collection('role')
    .where({
      name: db.command.in(roles),
    })
    .count();

  if (valid_count !== roles.length) {
    return { code: 'INVALID_PARAM', error: 'invalid roles' };
  }

  const old = admin;

  // update admim
  const data = { updated_at: Date.now() };

  // update password
  if (password) {
    data['password'] = hashPassword(password);
  }

  // username
  if (username && username != old.username) {
    const { total } = await db.collection('admin').where({ username }).count();
    if (total) return { code: 'INVALID_PARAM', error: 'username already exists' };
    data['username'] = username;
  }

  // avatar
  if (avatar && avatar != old.avatar) {
    data['avatar'] = avatar;
  }

  // name
  if (name && name != old.name) {
    data['name'] = name;
  }

  // roles
  if (roles) {
    data['roles'] = roles;
  }

  const r = await db
    .collection('admin')
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
