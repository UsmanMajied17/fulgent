

/* eslint-disable filenames/match-regex */
/* eslint-disable no-unused-vars */
/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 *@NModuleScope Public
 */

import search from 'N/search';
import record from 'N/record';

const TAG = 'ds_add_je_ref_on_po_ss';


const getVarianceEntriesForJERefSetting = () => {
  const results = [];
  const journalentrySearchObj = search.create({
    type: 'journalentry',
    settings: [{'name': 'consolidationtype', 'value': 'ACCTTYPE'}],
    filters:
        [
          ['type', 'anyof', 'Journal'],
          'AND',
          ['createdfrom', 'noneof', '@NONE@'],
          'AND',
          ['account.specialaccounttype', 'anyof', 'RecvNotBill'],
          'AND',
          ['createdfrom.custbody_dt_variance_je_ref', 'anyof', '@NONE@'],
        ],
    columns:
        [
          search.createColumn({
            name: 'internalid',
            summary: 'MAX',
            label: 'Internal ID',
          }),
          search.createColumn({
            name: 'createdfrom',
            summary: 'GROUP',
            label: 'Created From',
          }),
          search.createColumn({
            name: 'entity',
            join: 'createdFrom',
            summary: 'GROUP',
            label: 'Name',
          }),
          search.createColumn({
            name: 'closedate',
            join: 'createdFrom',
            summary: 'GROUP',
            label: 'Date Closed',
          }),
          search.createColumn({
            name: 'amount',
            summary: 'SUM',
            label: 'Amount',
          }),
        ],
  });
  const searchResultCount = journalentrySearchObj.runPaged().count;
  log.debug('journalentrySearchObj result count', searchResultCount);
  journalentrySearchObj.run().each(function(result) {
    results.push({
      id: result.getValue({name: 'internalid', summary: 'MAX'}),
      createdfrom: result.getValue({name: 'createdfrom', summary: 'GROUP'}),
      entity: result.getValue({name: 'entity', join: 'createdFrom', join: 'createdFrom', summary: 'GROUP'}),
      closedate: result.getValue({name: 'closedate', join: 'createdFrom', join: 'createdFrom', summary: 'GROUP'}),
      amount: result.getValue({name: 'amount', summary: 'SUM'}),
    });
    return true;
  });
  log.audit('getVarianceEntriesForJERefSetting', results);
  return results;
};
/**
  *
  * @param {*} context
  */
const execute = (context) => {
  const logTitle = `${TAG} => execute`;
  try {
    const results = getVarianceEntriesForJERefSetting();
    results.forEach((result) => {
      const poRecordId = record.submitFields({
        type: record.Type.PURCHASE_ORDER,
        id: result.createdfrom,
        values: {
          'custbody_dt_variance_je_ref': result.id,
        },
      });
    });
    log.audit('POs are updated with JE refs');
  } catch (error) {
    log.error(`${logTitle} => error`, error);
  }
};


export default {
  execute,
};
