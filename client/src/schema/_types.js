import Joi from 'joi';

// Idea: https://rangle.io/blog/how-to-create-data-driven-user-interfaces-in-vue/

// ##################################################################

// MySQL Types
const INT = Joi.number().integer().max(2147483647).min(-2147483648);
const INT_UNSIGNED = Joi.number().integer().max(4294967295).min(0);

// Custom Types
const PK = INT;
const ID = Joi.string().max(20);
const Text = Joi.string().max(45);

// ##################################################################

export default {

    INT: INT,
    INT_UNSIGNED: INT_UNSIGNED,

    PK: PK,
    ID: ID,
    Text: Text

}

// ##################################################################