import cloud from '@lafjs/cloud'

const db = cloud.database();
const hashPassword = cloud.shared.get('hashPassword');

export default async function (ctx: FunctionContext) {
  const { uid } = ctx.headers;
  const { oldpassword, newpassword } = ctx.body;

  if (!oldpassword || !newpassword) {
    return { code: 1000, message: "原密码或新密码不能为空" };
  }

  if (oldpassword === newpassword) {
    return { code: 1001, message: "原密码不能与新密码一样" };
  }

  const inactive = await db
    .collection('password')
    .where({ uid: uid, type: 'user', password: hashPassword(oldpassword), status: 'active' })
    .update({
      status: 'inactive',
      updated_at: Date.now(),
    });

  if (inactive.updated == 0) {
    return { code: 1002, message: "原密码不正确" };
  }

  await db.collection('password').add({
    uid: uid,
    password: hashPassword(newpassword),
    type: 'user',
    status: 'active',
    created_at: Date.now(),
    updated_at: Date.now(),
  });


  // 更新 token
  const expire = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  const payload = {
    uid: uid,
    type: 'user',
    exp: expire,
  };

  const access_token = cloud.getToken(payload);

  await db.collection('user-token').add({
    uid: uid,
    token: access_token,
    expired_at: expire * 1000,
    created_at: Date.now(),
    updated_at: Date.now()
  });

  return {
    code: 0,
    data: {
      access_token,
      uid: uid,
      expire,
    },
    message: "修改成功"
  };

}