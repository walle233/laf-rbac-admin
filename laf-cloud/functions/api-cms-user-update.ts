import cloud from '@lafjs/cloud'
import { PHONE, EMAIL } from '@/regex'

const db = cloud.database();

export default async function (ctx: FunctionContext) {

  const { uid } = ctx.headers;
  const { nickname, avatar, phone, email } = ctx.body;

  const data = { updated_at: Date.now() } as any;
  if (nickname) {
    data.nickname = nickname;
  }
  if (avatar) {
    data.avatar = [avatar];
  }
  if (phone) {
    if (!PHONE.test(phone)) {
      return { code: 1001, message: "手机号格式不正确" };
    }
    data.phone = phone;
  }
  if (email) {
    if (!EMAIL.test(email)) {
      return { code: 1002, message: "邮箱地址格式不正确" };
    }
    data.email = email;
  }


  const r = await db
    .collection('user')
    .where({ _id: uid })
    .update({
      ...data,
      updated_at: Date.now(),
    });

  return {
    code: 0,
    data: { ...r, uid },
  };
}