/* eslint-disable filenames/match-regex */

import http from 'N/http';
import query from 'N/query';
import search from 'N/search';
import nsRecord from 'N/record';
import task from 'N/task';
import runtime from 'N/runtime';
import globalConstants from '../common/ds_global_constants';
import Helper from '../common/ds_helper';
import moment from '/SuiteScripts/ds-fulgent/modules/third_party/moment.js';
const TAG = 'depreciation_manager';

const getBGSummaryRecords = () => {
  const sqlQuery =
  `SELECT
bg.id,
bg.name,
bg.custrecord_summary_histjournal as journal,
transaction.trandate as date,

FROM
CUSTOMRECORD_BG_SUMMARYRECORD as bg
join  transaction  on transaction.id =  bg.custrecord_summary_histjournal 
where custrecord_summary_histjournal is not null`;

  const queryResults = query.runSuiteQL({
    query: sqlQuery,
  });

  return queryResults.asMappedResults();
};

const getDepreciationHistoryRecords = (bgRecords) => {
  const bgRecordsNames = bgRecords.map((record) => record.name);
  const sqlQuery =
    `SELECT
id,
name,
custrecord_deprhistjournal
FROM
CUSTOMRECORD_NCFAR_DEPRHISTORY
where
 name in (${bgRecordsNames.map((bg) => `'${bg}'`).join(',')})
 AND
 custrecord_deprhistjournal is null
 `;
  log.debug('getDepreciationHistoryRecords: sqlQuery', sqlQuery);

  const queryResults = query.runSuiteQL({
    query: sqlQuery,
  });
  log.debug('queryResults', queryResults);

  const mappedResults = queryResults.asMappedResults();
  const resultArray = mappedResults.map((result) => {
    const matchingRecord = bgRecords.find((record) => record.name === result.name);
    return {
      id: result.id,
      journal: matchingRecord ? matchingRecord.journal : null,
      journalDate: matchingRecord ? matchingRecord.date : null,
    };
  });

  log.debug('resultArray', resultArray);
  return resultArray;
};

const addJournalRefToDepreciationHistoryRecords = () => {
  const bgSummaryRecords = getBGSummaryRecords();
  log.debug('bgSummaryRecords', bgSummaryRecords.length);
  const depreciationHistoryRecords = getDepreciationHistoryRecords(bgSummaryRecords);
  log.debug('depreciationHistoryRecords length', depreciationHistoryRecords.length);
  depreciationHistoryRecords.forEach((record) => {
    const {id, journal, journalDate} = record;

    const recordUpdated = nsRecord.submitFields({
      type: 'CUSTOMRECORD_NCFAR_DEPRHISTORY',
      id,
      values: {
        custrecord_deprhistjournal: journal,
        custrecord_ds_posting_date: journalDate,
      },
    });
    log.debug('recordUpdated', recordUpdated);
  });
  log.audit('Successfully updated depreciation history records');
};
const getDepriciationHistoryForAddingJeTypes = () => {
  const sqlQuery = `
  SELECT DISTINCT
custrecord_ds_posting_date,
custrecord_deprhisttype,
BUILTIN.DF(custrecord_deprhisttype) as depreciationtype,
custrecord_deprhistjournal,
FROM
CUSTOMRECORD_NCFAR_DEPRHISTORY depHistory
join transaction journal on journal.id = depHistory.custrecord_deprhistjournal
where
 custrecord_deprhistjournal is not null
AND
journal.custbody_dt_jes_type is null`;

  log.debug('getDepriciationHistoryForAddingJeTypes: sqlQuery', sqlQuery);
  const queryResults = query.runSuiteQL({
    query: sqlQuery,
  });

  return queryResults.asMappedResults();
};
const addJETypeOnJournals = () => {
  const CONSTANTS = globalConstants.get();
  const {CUSTOM_LISTS: {JE_TYPES, FAM_TRANSACTION_TYPES}} = CONSTANTS;
  const depreciationHistoryRecords = getDepriciationHistoryForAddingJeTypes();
  log.debug('depreciationHistoryRecords', depreciationHistoryRecords.length);

  const groupedData = Helper.groupedData(depreciationHistoryRecords, 'custrecord_deprhistjournal', 'journalGrouping');
  log.debug('groupedData', groupedData);

  groupedData.forEach((group) => {
    const {journalGrouping, custrecord_deprhistjournal: jeRef} = group;

    log.debug('journalGrouping', journalGrouping);
    let preferredType = '';
    let isAcquisition = false;
    let isDepreciation = false;
    let isWriteDown = false;
    let isDisposal = false;
    let isTransfer = false;
    journalGrouping.forEach((record) => {
      const {custrecord_deprhisttype: type} = record;
      switch (type) {
        case FAM_TRANSACTION_TYPES.VALUES.ACQUISITION:
          isAcquisition = true;
          break;
        case FAM_TRANSACTION_TYPES.VALUES.DEPRECIATION:
          isDepreciation = true;
          break;
        case FAM_TRANSACTION_TYPES.VALUES.WRITE_DOWN:
          isWriteDown = true;
          break;
        case FAM_TRANSACTION_TYPES.VALUES.DISPOSAL:
          isDisposal = true;
          break;
        case FAM_TRANSACTION_TYPES.VALUES.TRANSFER:
          isTransfer = true;
          break;

        default:
          break;
      }
    });
    log.audit('STATS', {isAcquisition, isDepreciation, isWriteDown, isDisposal, isTransfer});
    if (isDepreciation && !isAcquisition && !isWriteDown && !isDisposal && !isTransfer) {
      preferredType = JE_TYPES.VALUES.DEPRECIATION;
    }
    if (isDisposal && isDepreciation && !isAcquisition && !isWriteDown && !isTransfer) {
      preferredType = JE_TYPES.VALUES.DISPOSAL;
    }
    if (isTransfer && isDepreciation && isAcquisition && !isWriteDown && !isDisposal) {
      preferredType = JE_TYPES.VALUES.TRANSFER;
    }
    if (isWriteDown && isDepreciation && isAcquisition && isTransfer && !isDisposal) {
      preferredType = JE_TYPES.VALUES.WRITE_OFF;
    }
    if (isAcquisition && !isDepreciation && !isWriteDown && !isDisposal) {
      preferredType = JE_TYPES.VALUES.ACQUISITION;
    }
    log.debug('preferredType', preferredType);
    if (preferredType) {
      const recordUpdated = nsRecord.submitFields({
        type: nsRecord.Type.JOURNAL_ENTRY,
        id: jeRef,
        values: {
          custbody_dt_jes_type: preferredType,
        },
      });
      log.audit('Journal entry updated with ID: ', recordUpdated);
    }
  });

  log.audit('Successfully updated Journal Entries with JE types using depreciation history records');
};
const createDepreciationReportScreen = (context) => {
  const logTitle = `${TAG} => createDepreciationReportScreen`;
  const {request, response} = context;
  const {
    body = null,
    method,
    parameters,
  } = request;

  log.debug({
    title: 'body request',
    details: {
      method,
      body,
      parameters,
    },
  });
  try {
    const {
      returnMessage,
    } = parameters;

    const serverWidget = Helper.requireModule('N/ui/serverWidget');

    const message = Helper.requireModule('N/ui/message');
    // get data from saved search and map the resuls to sublist
    const formObject = serverWidget.createForm({
      title: 'Asset Summary Report',
    });
    formObject.addSubmitButton({
      label: 'Fetch Report',
    });
    const subsidiaryField = formObject.addField({
      id: 'custpage_subsidiary',
      type: serverWidget.FieldType.MULTISELECT,
      label: 'Subsidiary',
      source: 'subsidiary',
    });
    const fromDate = formObject.addField({
      id: 'custpage_fromdate',
      type: serverWidget.FieldType.DATE,
      label: 'From Date',
    });
    const toDate = formObject.addField({
      id: 'custpage_todate',
      type: serverWidget.FieldType.DATE,
      label: 'To Date',
    });
    subsidiaryField.isMandatory = true;
    fromDate.isMandatory = true;
    toDate.isMandatory = true;
    // const filters = {startDate: '7/1/2011', endDate: '7/1/2013', subsidiaries: []};
    // getAllFAMAssetRecords(filters);
    if (method === 'GET') {
      if (returnMessage) {
        formObject.addPageInitMessage({
          type: message.Type.CONFIRMATION,
          duration: 5000,
          title: 'Fetching report. This may take a while...',
          message: returnMessage,
        });
      }
      response.writePage(formObject);
    } else {
      const currentScript = runtime.getCurrentScript();
      log.audit('currentScript: ', currentScript);
      const {custpage_subsidiary: subsidiary, custpage_fromdate: fromDate, custpage_todate: toDate} = parameters;

      log.debug({
        title: 'Params',
        details: {
          subsidiary: subsidiary.split('\u0005'),
          fromDate,
          toDate,
        },
      });
      // trigger map reduce script
      const mrTask = task.create({
        taskType: task.TaskType.MAP_REDUCE,
        scriptId: 'customscript_dt_asset_summary_report_mr',
        deploymentId: 'customdeploy_dt_asset_summary_report_mr',
        params: {
          custscript_dt_am_subsidiary: subsidiary.split('\u0005'),
          custscript_dt_am_period_start_date: fromDate,
          custscript_dt_am_period_end_date: toDate,
        },
      });
      const mrTaskId = mrTask.submit();
      log.debug('MAP REDUCE SCRIPT TRIGGERED: ', mrTaskId);
      response.sendRedirect({
        type: http.RedirectType.SUITELET,
        identifier: currentScript.id,
        id: currentScript.deploymentId,
        parameters: {
          returnMessage: 'Please download the file from the Asset Summary Reports Folder in File Cabinet',
        },
      });
    }
  } catch (error) {
    log.error(`${logTitle} => error`, error);
  }
};
const getSubsidiaryNames = (subsidiaries) => {
  if (!subsidiaries?.length) return;
  // create a search for this
  const subsidiarySearch = search.create({
    type: search.Type.SUBSIDIARY,
    filters: [
      {
        name: 'internalid',
        operator: 'anyof',
        values: subsidiaries,
      },
    ],
    columns: ['name'],
  });

  const subsidiaryNames = [];
  subsidiarySearch.run().each((result) => {
    const name = result.getValue({name: 'name'});
    subsidiaryNames.push(name);
    return true;
  });

  return subsidiaryNames;
};
/**
 *
 * @param {*} startDate
 * @param {*} endDate
 * @param {*} subsidiaries
 * @return {Object} costObj
 */
const getAllFAMAssetRecords = (startDate, endDate, subsidiaries) => {
  const CONSTANTS = globalConstants.get();
  const {CUSTOM_LISTS: {FAM_TRANSACTION_TYPES}} = CONSTANTS;
  const sqlQuery =
  `SELECT DISTINCT
fam.id,
custrecord_assetcost cost,
  custrecord_assetstatus status,
  custrecord_assetpurchasedate purchasedate,
depHistoty.custrecord_deprhistdate,
BUILTIN.DF(custrecord_assettype) assettype,
custrecord_assetdisposaldate assetdisposaldate,
depHistoty.custrecord_deprhistamount amount,
depHistoty.custrecord_deprhistbookvalue bookvalue,
depHistoty.custrecord_deprhisttype depreciationhistorytype,


FROM
CUSTOMRECORD_NCFAR_ASSET fam 
join CUSTOMRECORD_NCFAR_DEPRHISTORY depHistoty on  depHistoty.custrecord_deprhistasset = fam.id 
where 
custrecord_assetsubsidiary IN (${subsidiaries.map((subsidiary) => `'${subsidiary}'`).join(',')})
AND
custrecord_assetpurchasedate BETWEEN '${startDate}' AND '${endDate}'

Order By depHistoty.custrecord_deprhistdate DESC`;
  log.debug('sqlQuery', sqlQuery);
  const results = Helper.getAllDataViaQuery(sqlQuery);
  log.debug('results', results.length);
  const result = {};
  const costObj = {};
  const depreciationObj = {};
  const subsidiaryNames = getSubsidiaryNames(subsidiaries);
  if (results?.length > 0) {
    // group by asset types
    const groupedData = Helper.groupedData(results, 'assettype', 'assetGrouping');
    log.debug('groupedData', groupedData);
    groupedData.forEach((group) => {
      const {assetGrouping, assettype: assetType} = group;
      costObj[assetType] = {};
      let beginningBalance = 0; let additions = 0; let disposals = 0; const transfers = 0; let endingBalance = 0;
      const depbeginningBalance = 0; const depAdditions = 0; let depDisposals = 0; const depTransfers = 0; const depEndingBalance = 0;
      log.debug('beginningStats', {beginningBalance, additions, disposals, transfers, endingBalance});
      assetGrouping.forEach((asset) => {
        // compare the date with the start date and end date
        const {cost, status, purchasedate, custrecord_deprhistdate: depHistoryDate,
          assetdisposaldate: assetDisposalDate, amount, depreciationhistorytype,
          bookvalue: depHistoryBookValue,
        } = asset;

        if (moment(purchasedate).isBefore(startDate) && moment(depHistoryDate).isSameOrAfter(startDate)) {
          beginningBalance += parseFloat(cost);
        }
        if (moment(purchasedate).isSameOrAfter(startDate) && moment(depHistoryDate).isSameOrAfter(startDate)) {
          additions += parseFloat(cost);
        }
        if (moment(depHistoryDate).isSameOrAfter(startDate) && moment(depHistoryDate).isBefore(endDate) && Number(status) === 4) {
          disposals += parseFloat(cost);
        }
        // TBD Transfers logic

        // DEPRECIATION SECTION

        if (moment(assetDisposalDate).isSameOrAfter(startDate) && moment(assetDisposalDate).isSameOrBefore(endDate)) {
          if (depreciationhistorytype === FAM_TRANSACTION_TYPES.VALUES.DEPRECIATION && (!amount || amount === 0)) {
            depDisposals += parseFloat(cost) - parseFloat(depHistoryBookValue);
            // log.debug('depDisposals', depDisposals);
          }
          if (depreciationhistorytype === FAM_TRANSACTION_TYPES.VALUES.DEPRECIATION &&
            moment(depHistoryDate).isBefore(moment(assetdisposaldate))
          ) {
            depDisposals += parseFloat(amount);
          }
        }
      });
      endingBalance = (beginningBalance + additions) - disposals; // ask about DMAS rule
      log.debug('endStats', {beginningBalance, additions, disposals, transfers, endingBalance});
      costObj[assetType] = {
        beginningBalance: beginningBalance.toFixed(2),
        additions: additions.toFixed(2),
        disposals: disposals.toFixed(2),
        transfers: transfers.toFixed(2),
        endingBalance: endingBalance.toFixed(2),
      };
      depreciationObj[assetType] = {
        beginningBalance: depbeginningBalance.toFixed(2),
        additions: depAdditions.toFixed(2),
        disposals: depDisposals.toFixed(2),
        transfers: depTransfers.toFixed(2),
        endingBalance: depEndingBalance.toFixed(2),
      };
    });
    log.audit('costObj', costObj);
  }
  result.costObj = costObj;
  result.subsidiaries = subsidiaryNames;
  result.fromDate = startDate;
  result.toDate = endDate;
  return result;
};
export default {
  addJournalRefToDepreciationHistoryRecords,
  addJETypeOnJournals,
  createDepreciationReportScreen,
  getAllFAMAssetRecords,
};
