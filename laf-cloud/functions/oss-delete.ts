import cloud from '@lafjs/cloud';

const db = cloud.database();
const checkPermission = cloud.shared.get('checkPermission');

export default async function (ctx: FunctionContext) {
  const { body } = ctx;
  const token = ctx.headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) return { code: 'NO_AUTH', error: 'permission denied' };

  // check permission
  const code = await checkPermission(uid, 'oss.manager.delete');
  if (code) {
    return 'Permission denied';
  }

  // check params
  const { _id } = body;
  if (!_id) {
    return { code: 'INVALID_PARAM', error: 'id cannot be empty' };
  }

  // check id
  const { data: file } = await db.collection('oss-manager').where({ _id }).getOne();
  if (!file) {
    return { code: 'INVALID_PARAM', error: 'not exists' };
  }

  // delete
  const r = await db.collection('oss-manager').doc(_id).remove();
  // console.log(r);

  return {
    code: 0,
    result: r,
  };
}