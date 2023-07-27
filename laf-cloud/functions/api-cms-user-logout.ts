import cloud from '@lafjs/cloud'

const db = cloud.database();

export default async function (ctx: FunctionContext) {
  const { authorization: token } = ctx.headers;
  if (!token) {
    return { code: 401, message: "用户未登录" };
  }

  const parsed = cloud.parseToken(token);
  const tuid = parsed.uid;
  if (!tuid) {
    return { code: 403, message: "无效的 Token" };
  }

  await db.collection('user-token').where({ 'uid': tuid, 'token': token }).remove();


  return { code: 0, message: "成功" }
}