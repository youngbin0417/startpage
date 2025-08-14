export const phoneFormat = (input) => {
  const digits = input.replace(/\D/g, "");

  // 번호를 하이픈 형식으로 포맷팅
  if (digits.length >= 4 && digits.length <= 7) {
    input = digits.slice(0, 3) + "-" + digits.slice(3);
  } else if (digits.length >= 8) {
    input =
      digits.slice(0, 3) + "-" + digits.slice(3, 7) + "-" + digits.slice(7);
  }
  return input;
};