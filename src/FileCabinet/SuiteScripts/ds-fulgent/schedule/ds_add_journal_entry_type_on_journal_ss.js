/* eslint-disable filenames/match-regex */
/* eslint-disable no-unused-vars */
/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 *@NModuleScope Public
 */


const TAG = 'ds_add_journal_entry_type_on_journal_ss';
import depreciationManager from '../modules/managers/depreciation_manager';
/**
 *
 * @param {*} context
 */
const execute = (context) => {
  const logTitle = `${TAG} => execute`;
  try {
    depreciationManager.addJETypeOnJournals();
  } catch (error) {
    log.error(`${logTitle} => error`, error);
  }
};


export default {
  execute,
};
