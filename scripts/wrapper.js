import * as beastmaster from './beastmaster.js';
import { log, moduleName } from './common.js';

function getSaveDC(wrapped) {
  let dc = wrapped();
  dc = beastmaster.getSaveDC(this, dc);
  return dc;
}

function getAttackToHit(wrapped) {
  let roll = wrapped();
  roll = beastmaster.getAttackToHit(this, roll);
  return roll;
}

export default async () => {
  libWrapper.register(moduleName, 'CONFIG.Item.documentClass.prototype.getAttackToHit', getAttackToHit, 'WRAPPER');
  libWrapper.register(moduleName, 'CONFIG.Item.documentClass.prototype.getSaveDC', getSaveDC, 'WRAPPER');
  log('Registered wrapper');
};
