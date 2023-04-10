import cloud from '@lafjs/cloud';
const db = cloud.database();
const shared = cloud.shared;

const checkPermission = shared.get('checkPermission');

export async function main(ctx: FunctionContext) {
  const { headers } = ctx;
  const token = headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) {
    return 'Unauthorized';
  }

  // check permission
  const code = await checkPermission(uid, 'permission.edit');
  if (code) {
    return 'Permission denied';
  }

  const { name, label, _id } = ctx.body;
  if (!_id || !name || !label) {
    return '_id or name or label cannot be empty';
  }

  // check id
  const { data: permission } = await db.collection('permission').where({ _id }).getOne();
  if (!permission) {
    return { code: 'INVALID_PARAM', error: 'not exists' };
  }

  // add permission
  const r = await db.collection('permission').where({ _id }).update({
    name,
    label,
    updated_at: Date.now(),
  });

  return {
    code: 0,
    result: r,
  };
}
