import cloud from '@lafjs/cloud';
import { PHONE, EMAIL } from '@/regex';
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

  // check permission
  const code = await checkPermission(uid, 'user.create');
  if (code) {
    return 'Permission denied';
  }

  // check params
  const { username, password, avatar, nickname, phone, email } = ctx.body;
  if (!username || !nickname || !password) {
    return 'username & nickname & password cannot be empty';
  }

  // check exist
  const { total } = await db.collection('user').where({ username }).count();
  if (total > 0) {
    return 'username already exists';
  }


  if (phone && !PHONE.test(phone)) {
    return { code: 1001, message: "手机号格式不正确" };
  }


  if (email && !EMAIL.test(email)) {
    return { code: 1001, message: "邮箱地址格式不正确" };
  }


  // add user
  const r = await db.collection('user').add({
    username,
    nickname,
    avatar: avatar ?? null,
    phone: phone ?? null,
    email: email ?? null,
    created_at: Date.now(),
    updated_at: Date.now(),
  });

  await db.collection('password').add({
    uid: r.id,
    password: hashPassword(password),
    type: 'user',
    status: 'active',
    created_at: Date.now(),
    updated_at: Date.now(),
  });

  return {
    code: 0,
    result: r,
  };
}
