
import { i18n } from '/@/i18n';

export const validateIp = (rule, value: string, callback) => {
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])$/;
    if (!value) {
        callback(new Error(i18n.global.t('message.validator.ipRequired')));
    } else if (!ipv4Regex.test(value) && !ipv6Regex.test(value)) {
        callback(new Error(i18n.global.t('message.validator.ipInvalid')));
    } else {
        callback();
    }
};

export const validateURL = (rule, value: string, callback) => {
    const urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    if (value === '' || urlPattern.test(value.trim())) {
        callback();
    } else {
        callback(new Error('Please enter a valid URL'));
    }
};

export const validateEmail = (rule, value, callback) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (emailPattern.test(value)) {
        callback();
    } else {
        callback(new Error('Please enter a valid email address'));
    }
};

export const validateNumeric = (rule, value, callback) => {
    if (!value) {
        return callback(new Error(i18n.global.t('message.validator.numberRequired')));
    }
    if (!/^\d+$/.test(value)) {
        callback(new Error(i18n.global.t('message.validator.numberRequired')));
    } else {
        callback();
    }
};

export const getArraySizeValidator = (min: number | null, max: number | null) => {
    const validator = (rule, value, callback) => {
        if (min !== null && value.length < min) {
            callback(new Error(i18n.global.t('message.validator.listSizeMin', [min])));
        } else if (max !== null && value.length > max) {
            callback(new Error(i18n.global.t('message.validator.listSizeMax', [max])));
        } else {
            callback();
        }
    };

    return validator;
};
