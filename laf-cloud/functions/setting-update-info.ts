import cloud from '@lafjs/cloud';
import { EMAIL } from '@/regex';

const db = cloud.database();
const checkPermission = cloud.shared.get('checkPermission');

export default async function (ctx: FunctionContext) {

  const { body } = ctx;
  const token = ctx.headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) return { code: 'NO_AUTH', error: 'permission denied' };

  // check permission
  const code = await checkPermission(uid, 'system.setting.edit');
  if (code) {
    return 'Permission denied';
  }

  const { key } = ctx.body;
  if (key === 'basic') {
    const { name, logo, icpCode, mobile, address, loginCode, systemOpen, closeText } = ctx.body;
    if (!name) {
      return { code: 1001, result: "网站名称不能为空" };
    }
    if (!logo) {
      return { code: 1001, result: "网站Logo不能为空" };
    }
    const data = { name, logo, updated_at: Date.now() };
    if (icpCode) {
      data['icpCode'] = icpCode;
    }
    if (mobile) {
      data['mobile'] = mobile;
    }
    if (address) {
      data['address'] = address;
    }
    if (loginCode) {
      data['loginCode'] = loginCode;
    }
    if (systemOpen) {
      data['systemOpen'] = systemOpen;
    }
    if (closeText) {
      data['closeText'] = closeText;
    }

    const result = await db.collection('setting').where({ key }).update(data);
    return { code: 0, result };
  } else if (key === 'email') {
    const { emailAddr, smtpAddr, smtpPort, smtpName, smtpPassword } = ctx.body;
    const data = { updated_at: Date.now() };
    if (emailAddr) {
      if (!EMAIL.test(emailAddr)) {
        return { code: 1101, message: "请输入正确的邮箱地址" };
      }
      data['emailAddr'] = emailAddr;
    }
    if (smtpAddr) {
      data['smtpAddr'] = smtpAddr;
    }
    if (smtpPort) {
      data['smtpPort'] = smtpPort;
    }
    if (smtpName) {
      data['smtpName'] = smtpName;
    }
    if (smtpPassword) {
      data['smtpPassword'] = smtpPassword;
    }

    const result = await db.collection('setting').where({ key }).update(data);
    return { code: 0, result };
  }
  return { code: 1000, result: "设置不存在" };
}