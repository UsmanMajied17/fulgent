/* eslint-disable filenames/match-regex */
/* eslint-disable no-unused-vars */

/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 *@NModuleScope Public
 */


import encode from 'N/encode';
import file from 'N/file';
import runtime from 'N/runtime';
import depreciationManager from '../modules/managers/depreciation_manager';

const mergeArrayStrings = (dataArray, params) => {
  log.debug('array of lenght in merge array strings is', dataArray.length);
  let mergedData = '';
  for (let index = Object.keys(params).length + 3; index < dataArray.length; index++) {
    let row = dataArray[index];
    if (!row) continue;
    row += '</Row>';
    log.debug('each row is ', row);
    mergedData += row;
  }
  return mergedData;
};

const findMaxArrayLengths = (finalData) => {
  try {
    log.debug('here in function');
    let revenueArrayLength = 0;
    let costArrayLength = 0;
    let overHeadsArrayLength = 0;

    log.debug('finalData', finalData);
    const names = Object.keys(finalData);
    log.debug('Names', names);
    log.debug('names Length', names.length);

    for (let index = 0; index < names.length; index++) {
      const employeeData = finalData[names[index]];

      const {revenue, cost, overheads} = employeeData;
      if (revenue.items.length > revenueArrayLength) {
        revenueArrayLength = revenue.items.length;
      }
      if (cost.items.length > costArrayLength) {
        costArrayLength = cost.items.length;
      }
      if (overheads.items.length > overHeadsArrayLength) {
        overHeadsArrayLength = overheads.items.length;
      }
    }

    log.debug('arrayLengths are', `revenueArrayLength${revenueArrayLength},
    costArrayLength${costArrayLength},
    overHeadsArrayLength${overHeadsArrayLength}`);
    return {
      revenueArrayLength,
      costArrayLength,
      overHeadsArrayLength,
    };
  } catch (error) {
    log.debug('error in finding max', error);
  }
};
const addHeadingRow = (stringArray, rowIndex, columnIndex, column, totalValue, data, rawValue) => {
  log.debug('adding heading row', rowIndex);
  let xmlStr1 = stringArray?.[rowIndex] || '';
  if (!xmlStr1) {
    xmlStr1 += `<Row ss:Index = "${rowIndex}">`;
  }
  let column1 = '';
  let column2 = '';
  if (column === 'Revenue') {
    column1 = 'Item';
    column2 = 'Amount';
  }

  if (totalValue) {
    if (column === 'Revenue') {
      column2 = `${data.items[0]?.currency || '$'}  ${data.total_revenue || '0'} `;
    } else if (column === 'Total Cost') {
      column2 = `${data.items[0]?.currency || '$'}  ${data.total_cost || '0'} `;
    } else if (column === 'Total OverHeads') {
      column2 = `${data.items[0]?.currency || '$'}  ${data.total_overhead || '0'} `;
    } else {
      column2 = `${data.items[0]?.currency || '$'}  ${rawValue || '0'} `;
    }
  }

  xmlStr1 += `<Cell ss:Index = "${columnIndex}" ss:StyleID="HeadingsColorWithBorder"><Data ss:Type="String">${column}</Data></Cell> `;
  xmlStr1 += `<Cell ss:Index = "${columnIndex + 1}" ss:StyleID="HeadingsColor"><Data ss:Type="String">${column1} </Data></Cell> `;
  xmlStr1 += `<Cell ss:Index = "${columnIndex + 2}" ss:StyleID="HeadingsColor"><Data ss:Type="String">${column2} </Data></Cell> `;

  log.debug('xmlStr1', xmlStr1);
  return xmlStr1;
};

const addDataRow = (data, stringArray, rowIndex, columnIndex, dataType) => {
  log.debug('adding data row', rowIndex);
  let xmlStr1 = '';
  let columnHead = '';
  let columnValue = '';
  let columnAmount = '';

  for (let index = 0; index < data?.items?.length; index++) {
    const item = data.items[index];
    log.debug('Processing item', item);

    if (dataType === 'Revenue') {
      columnHead = item.projectname || 'No Project';
      columnValue = item.item || 'No Item';
      columnAmount = item.revenue;
    } else if (dataType === 'Cost') {
      columnHead = item.projectname || 'No Project';
      columnValue = '';
      columnAmount = item.cost;
    } else if (dataType === 'Overhead') {
      columnHead = item.account || 'No Account';
      columnValue = '';
      columnAmount = item.amount;
    }

    log.debug('Column data', {columnHead, columnValue, columnAmount});

    xmlStr1 = stringArray?.[rowIndex] || '';
    if (!xmlStr1) {
      xmlStr1 += `<Row ss:Index = "${rowIndex}">`;
    }
    xmlStr1 += `<Cell ss:Index = "${columnIndex}" ss:StyleID="CellWithBlackBorder" ><Data ss:Type="String">${columnHead} </Data></Cell>` +
                   `<Cell ss:Index = "${columnIndex + 1}" ><Data ss:Type="String">${columnValue} </Data></Cell>` +
                   `<Cell ss:Index = "${columnIndex + 2}" ><Data ss:Type="String">${item.currency || '$'}  ${columnAmount || '0'}</Data></Cell>`;

    stringArray[rowIndex] = xmlStr1;
    rowIndex += 1;

    log.debug('Updated stringArray', stringArray);
    log.debug('Updated rowIndex', rowIndex);
  }

  log.debug('Completed adding data rows', {updatedStringArray: stringArray, updatedRowIndex: rowIndex});
  return {
    updatedStringArray: stringArray,
    updatedRowIndex: rowIndex,
  };
};

const additionalBalanceRows = (arrayLength, data, rowIndex, stringArray, columnIndex) => {
  log.debug('additionalBalanceRows', rowIndex);
  let xmlStr1 = '';
  if (arrayLength > data?.items?.length) {
    log.debug('revenue array length and other length is', `${arrayLength} and ${data?.items?.length}`);
    for (let itemIndex = 0; itemIndex < (arrayLength - data?.items?.length); itemIndex++) {
      xmlStr1 = stringArray?.[rowIndex] || '';
      if (!xmlStr1) {
        xmlStr1 += `<Row ss:Index = "${rowIndex}">` +
                `<Cell ss:Index = "${columnIndex}" ss:StyleID="CellWithBlackBorder"></Cell>`;
      } else {
        xmlStr1 += `<Cell ss:Index = "${columnIndex}" ss:StyleID="CellWithBlackBorder"></Cell>`;
      }
      stringArray[rowIndex] = xmlStr1;
      rowIndex += 1;
    }
  }
  log.debug('updatedRowIndex', rowIndex);
  return {
    updatedStringArray: stringArray,
    updatedRowIndex: rowIndex,
  };
};
const createExcelFile = (finalData) => {
  let xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
  xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
  xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
  xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
  xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
  xmlStr += 'xmlns:html="http://www.w3.org/TR/REC-html40">';

  // Define styles
  xmlStr += `
    <Styles>
        <Style ss:ID="TitleStyle">
            <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
            <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1"/>
        </Style>
        <Style ss:ID="SubHeading">
            <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
            <Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1"/>
        </Style>
        <Style ss:ID="HeaderStyle">
            <Font ss:Bold="1" ss:Color="#FFFFFF"/>
            <Interior ss:Color="#0070C0" ss:Pattern="Solid"/>
        </Style>
        <Style ss:ID="DataStyle">
            <Font ss:FontName="Calibri" ss:Size="11"/>
        </Style>
        <Style ss:ID="AssetType">
            <Font ss:Bold="1" ss:FontName="Calibri" ss:Size="11"/>
        </Style>
    </Styles>`;

  // Start Worksheet
  xmlStr += '<Worksheet ss:Name="Asset Summary Report">';
  xmlStr += '<Table>';

  // Expand columns for better display
  for (let i = 0; i < 7; i++) {
    xmlStr += `<Column ss:Width="150"/>`;
  }

  try {
    // Report Title (Merge Across 5 columns)
    xmlStr += `
            <Row>
                <Cell ss:StyleID="TitleStyle" ss:MergeAcross="5">
                    <Data ss:Type="String">Asset Summary Report</Data>
                </Cell>
            </Row>`;
    xmlStr += `
        <Row>
            <Cell ss:StyleID="SubHeading" ss:MergeAcross="5">
                <Data ss:Type="String">Fixed Asset Management - ${finalData?.subsidiaries.join(', ')}</Data>
            </Cell>
        </Row>`;
    xmlStr += `
          <Row>
              <Cell ss:StyleID="TitleStyle" ss:MergeAcross="5">
                  <Data ss:Type="String">GL Posting</Data>
              </Cell>
          </Row>`;
    xmlStr += `
          <Row>
              <Cell ss:StyleID="TitleStyle" ss:MergeAcross="5">
                  <Data ss:Type="String">Accounting Method - All Assets</Data>
              </Cell>
          </Row>`;
    xmlStr += `
        <Row>
            <Cell ss:StyleID="TitleStyle" ss:MergeAcross="5">
                <Data ss:Type="String">${finalData.fromDate} - ${finalData.toDate} </Data>
            </Cell>
        </Row>`;

    // Empty row for spacing
    xmlStr += `<Row></Row>`;

    // Empty row for spacing

    // Define table headers
    xmlStr += `
          <Row>
              <Cell ss:StyleID="HeaderStyle" ss:Index="2"><Data ss:Type="String">Beginning Balance</Data></Cell>
              <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Additions</Data></Cell>
              <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Disposals</Data></Cell>
              <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Transfers</Data></Cell>
              <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Ending Balance</Data></Cell>
          </Row>`;

    // Mock data (this would be dynamically populated based on your actual data)
    const assetData = [
      {beginningBalance: '1234', additions: '1234', disposals: '1234', transfers: '1234', endingBalance: '5000'},
      {beginningBalance: '1234', additions: '1234', disposals: '1234', transfers: '1234', endingBalance: '5000'},
      {beginningBalance: '1234', additions: '1234', disposals: '1234', transfers: '1234', endingBalance: '5000'},

    ];

    // COST sub heading
    xmlStr += `<Row> <Cell ss:StyleID="SubHeading"><Data ss:Type="String">Cost</Data></Cell> </Row>`;

    const costObj = finalData.costObj;
    const assetTypes = Object.keys(costObj);

    assetTypes.forEach((assetType) => {
      const data = costObj[assetType];
      xmlStr += `
        <Row>
            <Cell ss:StyleID="AssetType"><Data ss:Type="String">${assetType}</Data></Cell>
            <Cell ss:StyleID="DataStyle" ss:Index="2"><Data ss:Type="String">${data.beginningBalance}</Data></Cell>
            <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${data.additions}</Data></Cell>
            <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${data.disposals}</Data></Cell>
            <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${data.transfers}</Data></Cell>
            <Cell ss:StyleID="DataStyle"><Data ss:Type="Number">${data.endingBalance}</Data></Cell>
        </Row>`;
    });

    // End Table and Worksheet
    xmlStr += '</Table>';
    xmlStr += '</Worksheet>';
    xmlStr += '</Workbook>';

    // Save or output XML string

    const encodedXML = encode.convert({
      string: xmlStr,
      inputEncoding: encode.Encoding.UTF_8,
      outputEncoding: encode.Encoding.BASE_64,
    });
    const excelFile = file.create({
      name: `Asset Summary Report.xls`,
      fileType: file.Type.EXCEL,
      contents: encodedXML,
      folder: 453593,
    });

    const fileId = excelFile.save();

    log.debug('File saved successfully with ID: ', fileId);
    return fileId;
  } catch (error) {
    log.error('Error in creating excel file', error);
  }
};

const getInputData = () => {
  log.audit({
    title: 'Execution Start Time',
    details: new Date(),
  });
  const currentScript = runtime.getCurrentScript();
  const subsidiaries = JSON.parse(currentScript.getParameter({name: 'custscript_dt_am_subsidiary'}));
  const fromDate = currentScript.getParameter({name: 'custscript_dt_am_period_start_date'});
  const toDate = currentScript.getParameter({name: 'custscript_dt_am_period_end_date'});
  log.debug('stats', {subsidiaries, fromDate, toDate});

  const assetManagementData = depreciationManager.getAllFAMAssetRecords(fromDate, toDate, subsidiaries);
  return [assetManagementData];
};

const map = (context) => {
  log.debug('context in map', context);
  const {value} = context;
  log.debug('value', value);
  // parsing data into JSON.
  const finalData = JSON.parse(value);
  log.debug('final Data', finalData);
  createExcelFile(finalData);
  // creating excel file with the final data and maximum of all three arrays and params to use if required.
};

const summarize = (summary) => {
  log.audit({
    title: 'Execution End Time',
    details: new Date(),
  });
};

export default {
  getInputData,
  map,
  summarize,
};
