
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

  const { _id, enable, apis } = ctx.body;
  if (!_id) {
    return '_id cannot be empty';
  }


  const data = { updated_at: Date.now() } as any;
  if (enable) {
    data.enable = enable;
  }
  if (apis) {
    data.apis = apis;
  }


  // update schema
  const sapi = db.collection('schema-api').doc(_id);
  if (apis) {
    await sapi.update({
      apis: db.command.remove()
    });
  }
  const r = await sapi.update(data);

  return {
    code: 0,
    result: r,
  };

}
