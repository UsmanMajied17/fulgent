/**
 *@NApiVersion 2.1
 *@NModuleScope Public
 *@NScriptType UserEventScript
 */

// eslint-disable-next-line filenames/match-regex
import record from 'N/record';
import search from 'N/search';

/**
  *
  * @param {*} context
  */
const afterSubmit = (context) => {
  log.debug({title: 'afterSubmit', details: 'Triggered'});

  const {newRecord, type, UserEventType} = context;

  const {id: recordId, type: recordType} = newRecord;
  log.debug('type', recordType);
  try {
    if ([UserEventType.CREATE, UserEventType.EDIT].indexOf(type) === -1) return;

    const loadedRecord = record.load({
      type: recordType,
      id: recordId,
    });
    const systemNotes = searchSystemNotes(recordId);

    log.debug({title: 'systemNotes', details: systemNotes});

    if (systemNotes?.length > 0) {
      const [{setBy}] = systemNotes;
      if (Number(setBy) === -4) {
        loadedRecord.setValue({
          fieldId: 'approvalstatus',
          value: '2',
        });
        log.audit('Journal Entry approved');
      }

      loadedRecord.save();
    }
  } catch (error) {
    log.error({title: 'Error loading record', details: error});
  }
};

/**
  * Search system notes with specified filters
  * @param {number} recordId
  * @return {Array} search results
  */
const searchSystemNotes = (recordId) => {
  const systemNoteSearch = search.create({
    type: 'systemnote',
    filters: [
      ['recordtype', 'anyof', '-30'],
      'AND',
      ['name', 'anyof', '-4'],
      'AND',
      ['type', 'is', 'T'],
      'AND',
      ['recordid', 'equalto', recordId],
    ],
    columns: [
      {name: 'record', label: 'Record'},
      {name: 'name', label: 'Set by'},
      {name: 'context', label: 'Context'},
      {name: 'type', label: 'Type'},
    ],
  });

  const results = [];
  systemNoteSearch.run().each((result) => {
    results.push({
      setBy: result.getValue('name'),
    });
    return false;
  });

  return results;
};

export default {
  afterSubmit,
};
