/* eslint-disable filenames/match-regex */
/**
 *@NApiVersion 2.1
 *@NModuleScope Public
 *@NScriptType UserEventScript
 */

import nsRecord from 'N/record';

const TAG = 'ds_copy_code_to_external_id_ue';
const afterSubmit = (context) => {
  const logTitle = `${TAG} => afterSubmit`;
  if (context.type === context.UserEventType.CREATE || context.type === context.UserEventType.EDIT || context.type === context.UserEventType.XEDIT) {
    const {newRecord} = context;
    try {
      log.debug('newRecord.type', newRecord.type);
      const recordId = newRecord.id;
      const recordObj = nsRecord.load({
        type: newRecord.type,
        id: recordId,
      });
      let fieldId = '';
      switch (newRecord.type) {
        case nsRecord.Type.SUBSIDIARY:
          fieldId = 'custrecord_ds_code';
          break;
        case nsRecord.Type.DEPARTMENT:
          fieldId = 'custrecord_ds_department_code';
          break;
        case nsRecord.Type.CLASSIFICATION:
          fieldId = 'custrecord_ds_specialty_code';
          break;
        case nsRecord.Type.ACCOUNT:
          fieldId = 'acctnumber';
          break;
        case nsRecord.Type.LOCATION:
          fieldId = 'name';
          break;

        default:
          break;
      }
      const code = newRecord.getValue({
        fieldId,
      });
      log.debug('code', code);
      if (code) {
        recordObj.setValue({
          fieldId: 'externalid',
          value: code,
        });
        const recId = recordObj.save({
          ignoreMandatoryFields: true,
        });
        log.audit(`${newRecord.type} record with ID: ${recId} is updated with external id ${code}`, recId);
      }
    } catch (error) {
      log.error(`${logTitle} => error`, error);
    }
  }
};

export default {
  afterSubmit,
};
