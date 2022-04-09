export const generateCode = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

  const randomArray = Array.from(
    { length },
    (v, k) => chars[Math.floor(Math.random() * chars.length)]
  );

  const randomString = randomArray.join('');
  return randomString;
};