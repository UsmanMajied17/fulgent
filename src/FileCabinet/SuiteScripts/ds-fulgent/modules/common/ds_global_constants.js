
/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 * @namespace GlobalConstants
 * @file f3_global_constants.js module contains the contants values
 * @module GlobalConstants
 * @author Usman Majied
 */
// eslint-disable-next-line filenames/match-regex
define([], function() {
  const globalConstants = {
    COMMON: {
      INTERNAL_ID: 'internalid',
      MAINLINE: 'mainline',
      COGS: 'cogs',
      TAXLINE: 'taxline',
      TYPE: 'type',
      STATUS: 'status',
      FOLDER: 'folder',
      DOCUMENT_SIZE: 'documentsize',
      FILE_TYPE: 'filetype',
      NAME: 'name',
      TRANDATE: 'trandate',
      ENTITY: 'entity',
      TRANID: 'tranid',
      AMOUNT: 'amount',
      ByValue: 'value',
      ByText: 'text',
      LINE: 'line',
      GET: 'GET',
      POST: 'POST',
      ITEM: 'item',
      CREATED: 'created',

      TRANSACTION_TYPE: {
        INVOICE: 'CustInvc',
        SALES_ORDER: 'SalesOrd',
      },
      TRANSACTION_STATUS: {
        INVOICE: {
          OPEN: 'CustInvc:A',
        },
      },
      SORT: {ASC: 'ASC', DESC: 'DESC', NONE: 'NONE'},
    },
    INVOICE: {
      PRIOR_MONTH_ITEMS: 'custbody_f3_inv_prior_month_items',
    },
    SALES_ORDER: {
      CREATED_FROM: '',
      SUBLISTS: {
        ITEM: {},
      },
    },
    RECORD_TYPES: {
      FILE: 'file',
    },
    FILE_TYPES: {
      CSV: 'csv',
    },
    CONFIG_PATH: {
      SANDBOX: '/SuiteScripts/F3_ePromos_Customizations/config/sandbox',
      PRODUCTION: '/SuiteScripts/F3_ePromos_Customizations/config/production',
    },
    CONFIG: {},
    TASK_RECORD: {
      TYPE: 'task',
      BODY_FIELDS: {
        ASSIGNED: 'assigned',
        COMPANY: 'company',
        TITLE: 'title',
        STATUS: 'status',
        FRONT_END_PATH: 'custevent_f3_front_app_path_task_field',
        COMPLETE_DATE: 'completeddate',
        START_TIME: 'starttime',
        END_TIME: 'endtime',
      },
    },
    CUSTOMER_STATUS: {
      TYPE: 'customerstatus',
    },
    CUSTOMER: {
      TYPE: 'customer',
      BODY_FIELDS: {
        ENTITY_STATUS: 'entitystatus',
      },
    },
    MAP_REDUCE_SCRIPT: {
      EMAIL_SENDER_MR: {
        SCRIPT_ID: 'customscript_f3_send_email_mr',
        DEPLOYMENT_ID: 'customdeploy_f3_send_email_mr_dep',
        PARAMS: {},
      },
      SEND_TO_FACTORY_MR: {
        SCRIPT_ID: 'customscript_f3_send_to_factory_mr',
      },
      GENERATE_EXTEND_FILE_URL_MR: {
        SCRIPT_ID: 'customscript_f3_generate_extend_file_url',
      },
      UPDATE_POs_FROM_SOs: {
        SCRIPT_ID: 'customscript_f3_update_pos_from_so_mr',
      },
      TBD: {
        SCRIPT_ID: '',
        DEPLOYMENT_ID: '',
        PARAMS: {},
      },
    },

    SCHEDULED_SCRIPT: {
      ADD_JE_TYPE_ON_JE: {
        SCRIPT_ID: 'customscript_dt_add_je_types_on_je',
        DEPLOYMENT_ID: 'customdeploy_dt_add_je_types_on_je',
      },
      ADD_JE_REF_ON_DEP_RE: {
        SCRIPT_ID: 'customscript_ds_add_je_refs_to_dep_rec_s',
        DEPLOYMENT_ID: 'customdeploy_manual_exe',
      },
    },

    ACCOUNT_ROLE_PERMISSION: {
      TYPE: 'customrecord_ds_account_role_permission',
      FIELDS: {
        ROLE: 'custrecord_ds_acc_role_perm_role',
        ACCOUNT: 'custrecord_ds_acc_role_perm_account',
      },
    },
    CUSTOM_LISTS: {
      VARIANCE_TYPES: {
        ID: 'customlist_ds_variance_types',
        VALUES: {
          SALES_TAX_VARIANCE: 1,
          FREIGHT: 2,
        },
      },
      JE_TYPES: {
        ID: 'customlist_dt_je_type',
        VALUES: {
          DEPRECIATION: 1,
          DISPOSAL: 2,
          TRANSFER: 3,
          ACQUISITION: 4,
          WRITE_OFF: 5,

        },
      },
      FAM_TRANSACTION_TYPES: {
        ID: 'customlist_ncfar_transactiontype',
        VALUES: {
          ACQUISITION: 1,
          DEPRECIATION: 2,
          WRITE_DOWN: 4,
          DISPOSAL: 7,
          TRANSFER: 8,
        },
      },
    },

    CUSTOM_ERRORS: {
      INIT_MANAGERS: {
        NAME: 'INIT_MANAGERS',
        MESSGAE: 'Could not initialize the File Managers.',
      },
      GET_FILE_COLLECTION: {
        NAME: 'GET_FILE_COLLECTION',
        MESSGAE: 'Could not fetch the Files from Pending Folder.',
      },
      MOVE_FILE: {
        NAME: 'MOVE_FILE',
        MESSGAE: 'Could not move the file to the specified folder.',
      },
      CREATE_CSV_FILE: {
        NAME: 'CREATE_CSV_FILE',
        MESSGAE: 'Could not create th CSV file.',
      },
      PARSE_FILE: {NAME: 'PARSE_FILE', MESSGAE: 'Could not parse the file.'},
      TRANSFORM_FILE: {
        NAME: 'TRANSFORM_FILE',
        MESSGAE: 'Could not transform the file',
      },
    },
    PURCHASE_ORDER: {
      VARIANCE_TYPE: 'custcol_ds_variance_type',
    },
    FOLDER_IDS: {
      ASSET_SUMMARY_REPORT: 453593,
    },
  };

  const get = () => {
    return globalConstants;
  };

  return {get};
});
