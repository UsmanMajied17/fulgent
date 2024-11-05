/**
 *@NApiVersion 2.1
 *@NModuleScope Public
 *@NScriptType UserEventScript
 */

// eslint-disable-next-line filenames/match-regex
import globalConstants from '../modules/common/ds_global_constants';
/**
  *
  * @param {*} context
  */
const beforeSubmit = (context) => {
  log.debug({title: 'afterSubmit', details: 'Triggered'});

  const {newRecord, type, UserEventType} = context;

  const {type: recordType} = newRecord;
  log.debug('type', recordType);
  try {
    const CONSTANTS = globalConstants.get();
    const {CUSTOM_LISTS: {VARIANCE_TYPES}} = CONSTANTS;
    if ([UserEventType.CREATE].indexOf(type) === -1) return;
    const itemLineCount = newRecord.getLineCount({sublistId: 'item'});
    log.debug('itemLineCount', itemLineCount);
    let isAutoApprovalAllowed = true;
    // iterate through the item lines and check if the items are of type other charge, service or non-inventory
    for (let i = 0; i < itemLineCount; i++) {
      const itemType = newRecord.getSublistValue({
        sublistId: 'item',
        fieldId: 'itemtype',
        line: i,
      });
      log.debug('itemType', itemType);
      if (itemType !== 'OthCharge' && itemType !== 'Service' && itemType !== 'NonInvtPart') {
        isAutoApprovalAllowed = false;
        return;
      }
    }

    log.debug('isAutoApprovalAllowed after iterating item lines', isAutoApprovalAllowed);
    const expenseLineCount = newRecord.getLineCount({sublistId: 'expense'});

    // Iterate through the expense lines
    for (let i = 0; i < expenseLineCount; i++) {
      const varianceType = Number(newRecord.getSublistValue({
        sublistId: 'expense',
        fieldId: 'custcol_ds_variance_type',
        line: i,
      }));
      log.debug('varianceType', {varianceType, sales: VARIANCE_TYPES.VALUES.SALES_TAX_VARIANCE, freight: VARIANCE_TYPES.VALUES.FREIGHT});
      if ([VARIANCE_TYPES.VALUES.SALES_TAX_VARIANCE, VARIANCE_TYPES.VALUES.FREIGHT].indexOf(varianceType) < 0) {
        isAutoApprovalAllowed = false;
        break;
      }
    }
    log.debug('isAutoApprovalAllowed after expense lines', isAutoApprovalAllowed);

    if (isAutoApprovalAllowed) {
      newRecord.setValue({
        fieldId: 'approvalstatus',
        value: 2, // '2' typically represents "Approved"
      });
      newRecord.setValue({
        fieldId: 'custbody_sw_awa_approval_status',
        value: 4, // '2' typically represents "Approved"
      });
    }
  } catch (error) {
    log.error({title: 'Error loading record', details: error});
  }
};

export default {
  beforeSubmit,
};
