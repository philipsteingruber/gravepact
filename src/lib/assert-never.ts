export const assertNever = (x: never): never => {
  throw new Error(`Unhandled value: ${x}`);
};
