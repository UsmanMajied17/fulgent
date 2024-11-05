
/* eslint-disable filenames/match-regex */

/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope Public
 */

import runtime from 'N/runtime';
import search from 'N/search';
import message from 'N/ui/message';
import accountRoleManager from '../modules/managers/account_roles_manager';

const ALLOWED_BODY_ACCOUNT_TRANSACTIONS = ['inventoryadjustment'];

const showMessageBox = (title, messageText, type) => {
  const myMsg = message.create({
    title,
    message: messageText,
    type,
    duration: '3000',
  });
  myMsg.show();
};

const fieldChanged = (context) => {
  const {currentRecord: rec, sublistId: sublistName, fieldId: fieldName} = context;
  const {type: transactionType} = rec;

  log.debug('Transaction Type', transactionType);
  // Handle Inventory Adjustment Transaction
  if (ALLOWED_BODY_ACCOUNT_TRANSACTIONS.includes(transactionType)) {
    if (fieldName === 'account') {
      const currentUserRole = runtime.getCurrentUser().role;
      // Perform actions when the body-level Account field is changed
      const accountValue = rec.getValue({fieldId: 'account'});
      const isAccountExists = accountRoleManager.isAccountExists(accountValue);
      if (isAccountExists) {
        const rolePermissionExists = accountRoleManager.isRolePermissionAlreadyExist(currentUserRole, accountValue);
        if (!rolePermissionExists) {
          showMessageBox('Error', `Cannot add this account as it is not assigned to the role`, message.Type.ERROR);
          rec.setValue({fieldId: 'account', value: '', ignoreFieldChange: true});
          return;
        }
      }
    }
  }


  // Handle Journal Entry Transaction
  if (transactionType === 'journalentry' || transactionType === 'advintercompanyjournalentry') {
    if (sublistName === 'line') {
      if (fieldName === 'account') {
        const currentUserRole = runtime.getCurrentUser().role;
        // Perform actions when the line-level Account field is changed
        const lineAccountValue = rec.getCurrentSublistValue({
          sublistId: 'line',
          fieldId: 'account',
        });
        // Add your logic here
        console.log('Journal Entry Line Account Changed', lineAccountValue);
        const isAccountExists = accountRoleManager.isAccountExists(lineAccountValue);
        if (isAccountExists) {
          const rolePermissionExists = accountRoleManager.isRolePermissionAlreadyExist(currentUserRole, lineAccountValue);
          if (!rolePermissionExists) {
            showMessageBox('Error', `Cannot add this account as it is not assigned to the role`, message.Type.ERROR);
            rec.setCurrentSublistValue({
              sublistId: 'line',
              fieldId: 'account',
              value: null,
              ignoreFieldChange: true,
            });
            return;
          }
        }
      }
    }
  }
  if (sublistName === 'item' || sublistName === 'expense') {
    if (fieldName === 'item' || fieldName === 'account') {
      // Perform actions when the line-level Item field is changed
      console.log('Field Changed', fieldName);
      const lineValue = rec.getCurrentSublistValue({
        sublistId: fieldName === 'item' ? 'item' : 'expense',
        fieldId: fieldName === 'item' ? 'item' : 'account',
      });
        // Add your logic here
      console.log('LineValue', lineValue);
      // Get the current logged in user role and account
      const currentUserRole = runtime.getCurrentUser().role;
      console.log('currentUserRole', currentUserRole);
      let expenseAccount = null;
      if (fieldName === 'item') {
      // Lookup the item's expense account
        expenseAccount = search.lookupFields({
          type: 'item',
          id: lineValue,
          columns: ['expenseaccount'],
        }).expenseaccount;

        console.log('Item Expense Account', expenseAccount);
      }
      try {
        // Check if the role and account combination already exists
        if (expenseAccount?.length || lineValue) {
          const isAccountExists = accountRoleManager.isAccountExists((expenseAccount?.length && expenseAccount?.[0]?.value) || lineValue);
          if (isAccountExists) {
            const rolePermissionExists =
            accountRoleManager.isRolePermissionAlreadyExist(currentUserRole, (expenseAccount?.length && expenseAccount?.[0]?.value) || lineValue);
            const messageItem = (expenseAccount?.length && expenseAccount[0]?.value) ? 'item' : 'expense account';
            if (!rolePermissionExists) {
              showMessageBox('Error', `Cannot add this ${messageItem} because the account is not assigned to the role`, message.Type.ERROR);
              rec.setCurrentSublistValue({
                sublistId: sublistName,
                fieldId: fieldName,
                value: null,
                ignoreFieldChange: true,
              });
              return;
            }
          }
        }
      } catch (error) {
        console.log('Error checking role and account combination', error);
      }
    }
  }
};


export default {fieldChanged};
