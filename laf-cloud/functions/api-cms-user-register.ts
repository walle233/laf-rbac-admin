import cloud from '@lafjs/cloud'

const db = cloud.database();
const shared = cloud.shared;


const hashPassword = shared.get('hashPassword');

export default async function (ctx: FunctionContext) {

  const { username, password, avatar, phone, email } = ctx.body;

  if (!username || !password) {
    return 'username & password cannot be empty';
  }

  let { nickname } = ctx.body;
  if (!nickname) {
    nickname = username;
  }

  // check exist
  const { total } = await db.collection('user').where({ username }).count();
  if (total > 0) {
    return 'username already exists';
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