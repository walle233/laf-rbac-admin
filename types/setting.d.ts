interface SystemSetting {
  name: string;
  logo: string[];
  icpCode: string;
  mobile: string;
  address: string;
  loginCode: number;
  systemOpen: boolean;
  closeText: string;
}

interface SystemEmail {
  emailAddr: string;
  smtpAddr: string;
  smtpPort: string;
  smtpName: string;
  smtpPassword: string;
}
