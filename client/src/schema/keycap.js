const Types = require('./_types.js');

const schema = {
    // ===================================
    form: [
        {
            name: 'KeycapPk',
            fieldType: 'TextField',
            fieldValues: {
                placeholder: 'null',
                readOnly: true,
                required: true,
            },
        }, {
            name: 'KeycapId',
            fieldType: 'TextField',
            fieldValues: {
                placeholder: 'null',
                readOnly: false,
                required: true,
            },
        }, {
            name: 'KeycapName',
            required: true,
            fieldType: 'TextField',
            fieldValues: {
                placeholder: 'null',
                readOnly: false,
                required: true,
            },
        }, {
            name: 'MakerPk',
            required: true,
            fieldType: 'TextField',
            fieldValues: {
                placeholder: 'null',
                readOnly: true,
                required: true,
            },
        }, {
            name: 'MakerName',
            required: true,
            fieldType: 'SearchSelect',
            fieldValues: {
                placeholder: 'null',
                readOnly: false,
                required: true,
            },
        }, {
            name: 'ImagePk',
            required: false,
            fieldType: 'TextField',
            fieldValues: {
                placeholder: 'null',
                readOnly: false,
                required: true,
            },
        },
    ],
    // ===================================
    GET: [
        {
            name: 'KeycapPk',
            joiType: Types.PK.required(),
        },
    ],
    // ===================================
    POST: [
        {
            name: 'KeycapId',
            joiType: Types.ID.required(),
        }, {
            name: 'KeycapName',
            joiType: Types.Text.required(),
        }, {
            name: 'MakerPk',
            joiType: Types.PK.required(),
        }, {
            name: 'ImagePk',
            joiType: Types.PK.allow(null),
        }, {
            name: 'ImageURL',
            joiType: Types.Text.allow(null),
        },
    ],
    // ===================================
    PUT: [
        {
            name: 'KeycapPk',
            joiType: Types.PK.required(),
        }, {
            name: 'KeycapId',
            joiType: Types.ID.required(),
        }, {
            name: 'KeycapName',
            joiType: Types.Text.required(),
        }, {
            name: 'MakerPk',
            joiType: Types.PK.required(),
        }, {
            name: 'ImagePk',
            joiType: Types.PK.allow(null),
        },
    ],
    // ===================================
    DELETE: [
        {
            name: 'KeycapPk',
            joiType: Types.PK.required(),
        },
    ],

};
module.exports = schema;