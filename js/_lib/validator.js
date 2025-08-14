export const checkEmailError = (form) => {
  if (!form.email) {
    return '이메일을 입력해 주세요.';
  }
  const isEmail =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
      form.email,
    );
  if (!isEmail) {
    return '올바른 이메일을 입력해 주세요.';
  }
  return null;
};

export const checkPhoneError = (form) => {
  if (!form.phone) {
    return '휴대폰 번호를 입력해 주세요.';
  }
  const isPhone = /^\d{3}-\d{4}-\d{4}$/.test(form.phone);
  if (!isPhone) {
    return '올바른 휴대폰 번호를 입력해 주세요.';
  }
  return null;
};

export const checkPasswordError = (form) => {
  if (!form.password) {
    return '비밀번호를 입력해 주세요.';
  }
  if (form.password.length < 8) {
    return '비밀번호는 8자 이상이여야 합니다.';
  }

  return null;
};

export const checkPassconfError = (form) => {
  const passconf = form.passconf;
  if (!passconf) {
    return '비밀번호 획인을 입력해 주세요.';
  }

  const password = form.password;
  if (password !== passconf) {
    return '비밀번호가 일치하지 않습니다.';
  }

  return null;
};

export const checkNameError = (form) => {
  if (!form.name) {
    return '이름을 입력해 주세요.';
  }
  return null;
};

export const checkOfficeNameError = (form) => {
  const name = form.officeName;
  if (!name) {
    return '중개사무소명을 입력하세요.';
  }
  return null;
};

export const checkAgentNameError = (form) => {
  const name = form.agentName;
  if (!name) {
    return '대표자명을 입력하세요.';
  }
  return null;
};

export const checkBusinessCodeError = (form) => {
  const code = form.businessCode;
  if (!code) {
    return '사업자등록번호를 입력하세요.';
  }
  const isValid = /^\d{3}-\d{2}-\d{4}$/.test(code);
  if (!isValid) {
    return '올바른 사업자등록번호를 입력하세요.';
  }
  return null;
};

export const checkBrokerCodeError = (form) => {
  const brokerCode = form.brokerCode;
  if (!brokerCode) {
    return '중개사무소 등록번호를 입력하세요.';
  }
  return null;
};

export const checkTelError = (form) => {
  const name = form.tel;
  if (!name) {
    return '중개사무소 등록번호를 입력하세요.';
  }
  return null;
};

export const checkAddressError = (form) => {
  const name = form.address;
  if (!name) {
    return '중개사무소 등록번호를 입력하세요.';
  }
  return null;
};
