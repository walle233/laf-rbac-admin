
import cloud from '@lafjs/cloud'

const db = cloud.database();

const shared = cloud.shared;
const checkPermission = shared.get('checkPermission');

export default async function (ctx: FunctionContext) {

  const { headers } = ctx;
  const token = headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) {
    return 'Unauthorized';
  }

  // check permission
  const code = await checkPermission(uid, 'schema.api.edit');
  if (code) {
    return 'Permission denied';
  }
  
  const { _id, enable, list, count, read, add, update, remove } = ctx.body;
  if (!_id) {
    return '_id cannot be empty';
  }

  
  const data = { updated_at: Date.now() } as any;
  if (enable) {
    data.enable = enable;
  }
  if (list) {
    data.list = list;
  }
  if (count) {
    data.count = count;
  }
  if (read) {
    data.read = read;
  }
  if (add) {
    data.add = add;
  }
  if (update) {
    data.update = update;
  }
  if (remove) {
    data.remote = remove;
  }


  // update schema
  const r = await db.collection('schema-api').where({ _id }).update(data);

  return {
    code: 0,
    result: r,
  };

}
