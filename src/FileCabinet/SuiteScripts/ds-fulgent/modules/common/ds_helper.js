/* eslint-disable valid-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/**
 *@NApiVersion 2.1
 *@NModuleScope Public
 */
// eslint-disable-next-line filenames/match-regex
define([
  'N/search',
  'N/query',
  'N/util',
  '../third_party/lodash',
], function(search, query, util, _ ) {
  const requireModule = (module) => {
    require([module]);
    return require(module);
  };

  const getBooleanValue = (str) => {
    return str === 'T' || str === true;
  };

  const parseDataByFields = (fieldMap, records) => {
    const keys = Object.keys(fieldMap);
    return records.map((record) => {
      const parsedRec = {};
      keys.forEach((key) => {
        const fieldDataByKey = fieldMap[key];
        parsedRec[key] = record[fieldDataByKey.id];
        if (fieldDataByKey.nameField) {
          parsedRec[fieldDataByKey.nameField] =
            record[`${fieldDataByKey.id}_txt`];
        }
      });
      return parsedRec;
    });
  };

  // eslint-disable-next-line default-param-last
  const createCrudColumn = (fieldMap, crud, paramSortBy = '', useSummary) => {
    // eslint-disable-next-line no-param-reassign
    if (!paramSortBy) paramSortBy = '';
    const sortKeys = paramSortBy.split('||');
    const sortKeysMap = sortKeys.reduce((accumulator, key) => {
      const [sortKey, sortBy] = key.split(':');
      // eslint-disable-next-line no-param-reassign
      accumulator[sortKey] = sortBy;
      return accumulator;
    }, {});

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in fieldMap) {
      let sortBy = fieldMap[key].sortBy || search.Sort.NONE;

      if (sortKeysMap[key]) {
        if (sortKeysMap[key] === 'ASC') {
          sortBy = search.Sort.ASC;
        } else if (sortKeysMap[key] === 'DESC') {
          sortBy = search.Sort.DESC;
        }
      }
      // eslint-disable-next-line no-continue
      if (useSummary && !fieldMap[key].summary) continue;

      const column = search.createColumn({
        name: fieldMap[key].id,
        join: fieldMap[key].join,
        sort: sortBy,
        formula: fieldMap[key].formula,
        summary: useSummary && fieldMap[key].summary,
      });
      crud.columns.push(column);
    }
  };

  const getAllRecords = (context, crud, FIELDS, donotApplyFilters) => {
    createCrudColumn(FIELDS, crud);

    if (donotApplyFilters) return crud.searchAllRecords();

    const apiParams = getApiFilterParams(context, FIELDS);
    const {filters} = apiParams;
    const findInActive = _.find(filters, {name: 'isinactive'});
    if (!findInActive) {
      filters.push({
        name: 'isinactive',
        operator: 'is',
        values: false,
      });
    }
    return crud.searchAllRecords({filters});
  };
  /**
  *
  * @param {Array} data
  * @param groupBy
  * @param keyName
  * @return {Array}
  */
  const groupedData = (data, groupBy, keyName) => {
  // let columns = Object.keys(data[0]).map((colName) => {
    //   return alterColumnName(colName);
    // });
    log.debug({
      title: 'groupBy',
      details: groupBy,
    });
    log.debug({
      title: 'keyName',
      details: keyName,
    });
    const columns = Object.keys(data[0]).map((colName) => {
      return colName;
    });
    data = data.map((item) => {
      const values = _.values(item);
      const obj = {};
      for (let i = 0; i < columns.length; i++) {
        obj[columns[i]] = values[i];
      }

      return obj;
    });

    data = _.groupBy(data, function(o) {
      return o[`${groupBy}`];
    });

    const ownProps = Object.keys(data);
    let i = ownProps.length;
    const resArray = new Array(i);

    // eslint-disable-next-line no-plusplus
    while (i--) {
      resArray[i] = [ownProps[i], data[ownProps[i]]];
    }

    const finalData = resArray.map((fulfillment, index) => {
      const obj = {};
      // eslint-disable-next-line prefer-destructuring
      obj[groupBy] = fulfillment[0];
      obj[keyName] = [...fulfillment[1]];
      return obj;
    });

    return finalData;
  };
  const triggerScheduledScriptTask = (
      scriptId,
      deploymentId,
  ) => {
    try {
      const nsTask = requireModule('N/task');
      const scriptTask = nsTask.create({
        taskType: nsTask.TaskType.SCHEDULED_SCRIPT,
        scriptId,
        deploymentId,
      });
      return scriptTask.submit();
    } catch (error) {
      log.error({
        title: 'triggerScheduledScriptTask error scriptId: ' + scriptId + ' deploymentId: ' + deploymentId,
        details: JSON.stringify(error),
      });
      throw error;
    }
  };
  const getScriptStatus = (taskId) => {
    const nsTask = requireModule('N/task');
    return nsTask.checkStatus({
      taskId: taskId,
    });
  };
  const getAllDataViaQuery = (queryString) => {
    let results = []; // Array to store the results

    try {
      // Create and run the SuiteQL query with pagination
      const suiteQLQuery = query.runSuiteQLPaged({
        query: queryString,
        pageSize: 1000, // Maximum records per page
      });
      log.debug('suiteQLQuery', suiteQLQuery);
      // Iterate through the pages and fetch all records
      suiteQLQuery.pageRanges.forEach(function(pageRange) {
        const page = suiteQLQuery.fetch({index: pageRange.index});
        const pageResults = page.data.asMappedResults();
        // Process each row in the current page
        results = results.concat(pageResults);
      });
      return results;
    } catch (e) {
      log.error('Error in fetchAllRecords', e.toString());
    }
  };
  return {
    getBooleanValue,
    parseDataByFields,
    createCrudColumn,
    getAllRecords,
    requireModule,
    groupedData,
    getAllDataViaQuery,
  };
});
