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
  const code = await checkPermission(uid, 'permission.create');
  if (code) {
    return 'Permission denied';
  }

  const { name, label } = ctx.body;
  if (!name || !label) {
    return 'name or label cannot be empty';
  }

  // check exist
  const { total } = await db.collection('permission').where({ name }).count();
  if (total > 0) {
    return 'permission already exists';
  }

  // add permission
  const r = await db.collection('permission').add({
    name,
    label,
    created_at: Date.now(),
    updated_at: Date.now(),
  });

  return {
    code: 0,
    result: r,
  };
}
