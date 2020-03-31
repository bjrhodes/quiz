export const pathIsArray = (path, obj) =>
    path.reduce((child, next) => child ? child[next] : undefined, obj);
