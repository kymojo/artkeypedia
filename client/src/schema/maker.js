const Types = require('./_types.js');

const schema = {
    // ===================================
    form: [
        {
            name: 'MakerPk',
            joiType: Types.INT.required(),
            fieldType: 'TextField',
            fieldValues: {
                placeholder: 'null',
                readOnly: true,
            },
        }, {
            name: 'MakerId',
            joiType: Types.ID.required(),
            fieldType: 'TextField',
            fieldValues: {
                placeholder: 'null',
                readOnly: false,
            },
        }, {
            name: 'MakerName',
            joiType: Types.Text.required(),
            fieldType: 'TextField',
            fieldValues: {
                placeholder: 'null',
                readOnly: false,
            },
        }, {
            name: 'MakerWebsite',
            joiType: Types.Text.allow(null),
            fieldType: 'TextField',
            fieldValues: {
                placeholder: 'null',
                readOnly: false,
            },
        }, {
            name: 'MakerInstagram',
            joiType: Types.Text.allow(null),
            fieldType: 'TextField',
            fieldValues: {
                placeholder: 'null',
                readOnly: false,
            },
        }, {
            name: 'MakerReddit',
            joiType: Types.Text.allow(null),
            fieldType: 'TextField',
            fieldValues: {
                placeholder: 'null',
                readOnly: false,
            },
        }, {
            name: 'MakerGeekhack',
            joiType: Types.Text.allow(null),
            fieldType: 'TextField',
            fieldValues: {
                placeholder: 'null',
                readOnly: false,
            },
        },
    ],
    // ===================================
    GET: [
        {
            name: 'MakerPk',
            joiType: Types.PK.required(),
        },
    ],
    // ===================================
    POST: [
        {
            name: 'MakerId',
            joiType: Types.ID.required(),
        }, {
            name: 'MakerName',
            joiType: Types.Text.required(),
        }, {
            name: 'MakerWebsite',
            joiType: Types.Text.allow(null),
        }, {
            name: 'MakerInstagram',
            joiType: Types.Text.allow(null),
        }, {
            name: 'MakerReddit',
            joiType: Types.Text.allow(null),
        }, {
            name: 'MakerGeekhack',
            joiType: Types.Text.allow(null),
        }, {
            name: 'ImagePk',
            joiType: Types.PK.allow(null),
        }, {
            name: 'ImageUrl',
            joiType: Types.Text.allow(null),
        }
    ],
    // ===================================
    PUT: [
        {
            name: 'MakerPk',
            joiType: Types.INT.required(),
        }, {
            name: 'MakerId',
            joiType: Types.ID.required(),
        }, {
            name: 'MakerName',
            joiType: Types.Text.required(),
        }, {
            name: 'MakerWebsite',
            joiType: Types.Text.allow(null),
        }, {
            name: 'MakerInstagram',
            joiType: Types.Text.allow(null),
        }, {
            name: 'MakerReddit',
            joiType: Types.Text.allow(null),
        }, {
            name: 'MakerGeekhack',
            joiType: Types.Text.allow(null),
        },
    ],
    // ===================================
    DELETE: [
        {
            name: 'MakerPk',
            joiType: Types.INT.required(),
        },
    ],
};
module.exports = schema;