const text = {
  WRAPPER: {
    SUCCESS: 'success',
    FAIL: 'fail',
    USER: 'USER',
    POST: 'POST',
    SUCCESS_DB_SELECT_ONE: 'Success Get One Data',
    SUCCESS_DB_SELECT: 'Success Get Data',
    SUCCESS_DB_INSERT: 'Success Insert Data',
    SUCCESS_DB_DELETE: 'Success Delete Data',
    SUCCESS_DB_UPDATE: 'Success Update Data',
    FAILED_DB_SELECT_ONE: 'Failed Get One Data',
    FAILED_DB_SELECT: 'Failed Get Data',
    FAILED_DB_INSERT: ( val ) => 'Failed Insert Data ' + val,
    FAILED_DB_DELETE: 'Failed Delete Data',
    FAILED_DB_UPDATE: ( val ) => 'Failed Update Data ' + val,
    ERROR_IS_EXIST: 'data already exist',
    NOT_FOUND_ID_PARENT: 'id parent not found',
    NOT_COMPLETE_PIPELINE_DATA: 'please check the completeness of the data pipeline or data is not exist',
    DATA_NOT_COMPLETE: 'data not complete',
    HAS_BEEN_UPDATED_SYS: 'data has been updated by system',
    HAS_BEEN_UPDATED_ADM: 'data has been updated by admin',
    CANT_UPDATE: 'cant be updated',
    CANT_EMPTY: 'cant be empty',
    UNDEFINED_ID: 'undefined ID',
    EMPTY_ID: 'ID must be filled',
    DATA_NOT_FOUND: 'Data Not Found',
    DATA_NOT_REGISTERED: 'Data Not Registered',
    REQUEST_PROCESSED: 'Your Request Has Been Processed',
    INVALID_DATE: 'Invalid date',
    INVALID_TOKEN: 'Invalid token!',
    EXPIRED_TOKEN: 'Expired token!',
    INVALID_REFRESH_TOKEN: 'Invalid refresh token!',
    EXPIRED_REFRESH_TOKEN: 'Expired refresh token!',
    VERIFIED_REFRESH_TOKEN: 'Refresh Token is verified',
    FILE_SIZE_REACHED: 'File size is too big, maximum 25mb',
    NOT_FILE_UPLOAD: 'Please upload a file!',
    MAX_UPLOAD_IMG: 'Image must be less then 10 Mb',
    MAX_UPLOAD_FILE: 'Image must be less then 25 Mb',
    FAILED_SORT: 'Failed Sort, more than one parameter',
    FAILED_NEXT_PREV : 'not found or id distance is too far, please search on the list page',
    INVALID_LOGIN : 'id or password Invalid',
    THROTTLING_LOGIN: 'You Reach Your Maximum Login Attempt, Please Try Again in 30 Seconds',
    NOT_ALLOW: 'Not Allowed',
    IS_UP_TO_DATE: 'data entered is up-to-date ',
    UNAUTHORIZED_ERROR: 'Please, Login First!',
    NOT_ALLOW_PARAMS_SAME_TIME: 'params cannot be filled at the same time'
  }
};

module.exports = text;
