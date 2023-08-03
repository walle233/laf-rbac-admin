import cloud from '@lafjs/cloud'

const db = cloud.database();
const checkPermission = cloud.shared.get('checkPermission');

export default async function (ctx: FunctionContext) {

  const { body } = ctx;
  // const token = ctx.headers['authorization'].split(' ')[1];
  // const parsed = cloud.parseToken(token);
  // const uid = parsed.uid;
  // if (!uid) return { code: 'NO_AUTH', error: 'permission denied' };

  // // check permission
  // const code = await checkPermission(uid, 'system.setting.read');
  // if (code) {
  //   return 'Permission denied';
  // }

  const { key } = ctx.body;

  const { data } = await db.collection('setting').where({ key }).getOne();

  return { code: 0, result: data }
}