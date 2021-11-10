export const moduleName = 'aardvarks';
export const flankingFlag = 'targetFlankingBonus';

export const log = (message, ...args) => {
  // eslint-disable-next-line no-console
  console.info(`${moduleName} | ${message}`, ...args);
};

export const measureGrid = async (a, b) => {
  const dist = await canvas.grid.measureDistances([{ ray: new Ray(a, b) }], { gridSpaces: true });
  return dist;
};

export const findToken = (tokenId) => canvas.tokens.ownedTokens.filter((t) => t.id === tokenId)[0];
