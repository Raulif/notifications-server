export const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.substring(1);
export const getOtherUserName = (user: string) =>
  user === 'papa' ? 'mama' : 'papa';

const routeNameToMethodsMap: Record<string, Array<string>> = {
  notification: ['GET', 'POST', 'PUT', 'OPTIONS'],
  subscription: ['POST', 'OPTIONS'],
};

export const setCors = (
  // deno-lint-ignore no-explicit-any
  ctx: any,
  next: () => Promise<unknown>,
  routeName: string
) => {
  ctx.response.headers.set('Access-Control-Allow-Origin', '*');
  ctx.response.headers.set(
    'Access-Control-Allow-Methods',
    routeNameToMethodsMap[routeName].join(',')
  );
  ctx.response.headers.set(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );

  return next();
};
