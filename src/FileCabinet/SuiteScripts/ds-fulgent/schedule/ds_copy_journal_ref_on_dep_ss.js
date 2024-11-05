/* eslint-disable filenames/match-regex */
/* eslint-disable no-unused-vars */
/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 *@NModuleScope Public
 */


const TAG = 'ds_copy_journal_ref_on_dep_ss';
import depreciationManager from '../modules/managers/depreciation_manager';
/**
 *
 * @param {*} context
 */
const execute = (context) => {
  const logTitle = `${TAG} => execute`;
  try {
    depreciationManager.addJournalRefToDepreciationHistoryRecords();
  } catch (error) {
    log.error(`${logTitle} => error`, error);
  }
};


export default {
  execute,
};
