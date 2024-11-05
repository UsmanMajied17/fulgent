/* eslint-disable filenames/match-regex */
/* eslint-disable no-unused-vars */

/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@NModuleScope Public
 */


const TAG = 'dt_depreciation_report_sl';

import depreciationManager from '../modules/managers/depreciation_manager';

const onRequest = (context) => {
  try {
    depreciationManager.createDepreciationReportScreen(context);
  } catch (error) {
    log.error({
      title: 'Request Change Suitelet',
      details: error,
    });
  }
};

export default {
  onRequest,
};
