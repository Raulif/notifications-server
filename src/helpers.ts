export const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.substring(1);
export const getOtherUserName = (user: string) => (user === 'papa' ? 'mama' : 'papa');
