/* eslint-disable filenames/match-regex */


import http from 'N/http';
import message from 'N/ui/message';
import runtime from 'N/runtime';
import search from 'N/search';
import record from 'N/record';

import globalConstants from '../common/ds_global_constants';
import helper from '../common/ds_helper';

const TAG = 'account_roles_manager';


/**
 * Checks if an account exists.
 *
 * @param {string} account - The account to check.
 * @return {boolean} - Returns true if the account exists, false otherwise.
 */
const isAccountExists = (account) => {
  const logTitle = `${TAG} => isAccountExists`;
  const {ACCOUNT_ROLE_PERMISSION: {TYPE, FIELDS}} = globalConstants.get();
  try {
    const accountSearch = search.create({
      type: TYPE,
      filters: [
        search.createFilter({
          name: FIELDS.ACCOUNT,
          operator: search.Operator.ANYOF,
          values: account,
        }),
      ],
    });
    const searchResults = accountSearch.run().getRange({
      start: 0,
      end: 1,
    });
    log.debug(`${logTitle} => searchResults`, searchResults);
    return searchResults.length > 0;
  } catch (error) {
    log.error(`${logTitle} => error`, error);
  }
};

const isRoleExists = (role) => {
  const logTitle = `${TAG} => isRoleExists`;
  const {ACCOUNT_ROLE_PERMISSION: {TYPE, FIELDS}} = globalConstants.get();
  try {
    const roleSearch = search.create({
      type: TYPE,
      filters: [
        search.createFilter({
          name: FIELDS.ROLE,
          operator: search.Operator.ANYOF,
          values: role,
        }),
      ],
    });
    const searchResults = roleSearch.run().getRange({
      start: 0,
      end: 1,
    });
    log.debug(`${logTitle} => searchResults`, searchResults);
    return searchResults.length > 0;
  } catch (error) {
    log.error(`${logTitle} => error`, error);
  }
};
/**
 *
 * @param {*} role
 * @param {*} account
 * @return {boolean}
 */
const isRolePermissionAlreadyExist = (role, account) => {
  const logTitle = `${TAG} => isrolePermissionAlreadyExist`;
  const {ACCOUNT_ROLE_PERMISSION: {TYPE, FIELDS}} = globalConstants.get();
  try {
    const roleAccountSearch = search.create({
      type: TYPE,
      filters: [
        search.createFilter({
          name: FIELDS.ROLE,
          operator: search.Operator.ANYOF,
          values: role,
        }),
        search.createFilter({
          name: FIELDS.ACCOUNT,
          operator: search.Operator.ANYOF,
          values: account,
        }),
      ],
    });
    const searchResults = roleAccountSearch.run().getRange({
      start: 0,
      end: 1,
    });
    log.debug(`${logTitle} => searchResults`, searchResults);
    return searchResults.length > 0;
  } catch (error) {
    log.error(`${logTitle} => error`, error);
  }
};
const createRoleAccountPermissionScreen = (context) => {
  const logTitle = `${TAG} => createRoleAccountPermissionScreen`;
  const {ACCOUNT_ROLE_PERMISSION: {TYPE, FIELDS}} = globalConstants.get();
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
      isRolePermissionSaved,
    } = parameters;

    const serverWidget = helper.requireModule('N/ui/serverWidget');
    // get data from saved search and map the resuls to sublist
    const formObject = serverWidget.createForm({
      title: 'Set Account Role Permissions',
    });
    formObject.addSubmitButton({
      label: 'Send',
    });
    const accountField = formObject.addField({
      id: 'custpage_account',
      type: serverWidget.FieldType.SELECT,
      label: 'Account',
      source: 'account',
    });
    const roleField = formObject.addField({
      id: 'custpage_role',
      type: serverWidget.FieldType.MULTISELECT,
      label: 'Role',
      source: 'role',
    });
    roleField.isMandatory = true;
    accountField.isMandatory = true;
    if (method === 'GET') {
      if (returnMessage) {
        formObject.addPageInitMessage({
          type: isRolePermissionSaved === 'true' ? message.Type.CONFIRMATION: message.Type.ERROR,
          duration: 5000,
          title: isRolePermissionSaved === 'true' ? 'Processing...' : 'Error',
          message: returnMessage,
        });
      }

      //     accountField.addSelectOption({
      //       fieldId: 'custpage_account',
      //       value: account.id,
      //       text: account.name,
      //       isSelected: false,
      //     });
      //   });
      response.writePage(formObject);
    } else {
      const currentScript = runtime.getCurrentScript();
      log.audit('currentScript: ', currentScript);
      let isRolePermissionSaved = false;
      const {custpage_role: roles, custpage_account: account} = parameters;

      log.debug({
        title: 'custpage_role and custpage_account',
        details: {
          roles: roles.split('\u0005'),
          account,
        },
      });
      const rolesList = roles.split('\u0005');
      log.debug('rolesList', rolesList);
      const isrolePermissionAlreadyExists = isRolePermissionAlreadyExist(rolesList, account);
      log.debug(`${logTitle} => isrolePermissionAlreadyExists`, isrolePermissionAlreadyExists);
      let returnMessage = '';
      if (isrolePermissionAlreadyExists) {
        returnMessage = 'Role Permission already exists...';
      } else {
        const roleAccountRecord = record.create({
          type: TYPE,
        });
        roleAccountRecord.setValue({
          fieldId: FIELDS.ROLE,
          value: rolesList,
        });
        roleAccountRecord.setValue({
          fieldId: FIELDS.ACCOUNT,
          value: account,
        });
        const roleAccountRecordSaved = roleAccountRecord.save();
        log.audit(`${logTitle} => roleAccountRecordSaved saved with ID: `, roleAccountRecordSaved);
        isRolePermissionSaved = true;
        returnMessage = 'Role Permission has been saved...';
      }
      response.sendRedirect({
        type: http.RedirectType.SUITELET,
        identifier: currentScript.id,
        id: currentScript.deploymentId,
        parameters: {
          returnMessage,
          isRolePermissionSaved,
        },
      });
    }
  } catch (error) {
    log.error(`${logTitle} => error`, error);
  }
};
export default {
  createRoleAccountPermissionScreen,
  isRolePermissionAlreadyExist,
  isAccountExists,
  isRoleExists,
};
