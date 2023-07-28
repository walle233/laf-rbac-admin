import cloud from '@lafjs/cloud'

const db = cloud.database();

export default async function (ctx: FunctionContext) {
  const { key } = ctx.body;
  if (key === 'setting') {
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