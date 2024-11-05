/* eslint-disable filenames/match-regex */
/* eslint-disable no-unused-vars */

/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@NModuleScope Public
 */

import serverWidget from 'N/ui/serverWidget';
import AccountRoleManager from '../modules/managers/account_roles_manager';

const TAG = 'ds_role_account_sl';


const onRequest = (context) => {
  try {
    AccountRoleManager.createRoleAccountPermissionScreen(context);
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
