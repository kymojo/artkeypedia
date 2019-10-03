const connection = require('../dbConnection.js');
const schema = require('../../client/src/schema/keycap.js');
const ApiHelper = require('./api-helper.js');

const keycapApi = {
    // -----------------------------------------------
    GET_all: function (req, res) {

        const select_caps = `
            SELECT
                k.KeycapPk,
                k.KeycapId,
                k.KeycapName,
                m.MakerPk,
                m.MakerName,
                i.ImagePk 
            FROM caps.a_keycap k
            LEFT JOIN caps.a_maker m ON k.MakerPk = m.MakerPk
            LEFT JOIN caps.a_image i ON k.ImagePk = i.ImagePk;
        `;

        ApiHelper.runApiWrapper(req, res, {}, (api) => {

            ApiHelper.runApiQuery(select_caps, api, (api, result) => {

                ApiHelper.runApiReturnRows(api, result);
            });
        });
    },
    // -----------------------------------------------
    GET: function (req, res) {

        const select_caps = `
            SELECT
                k.KeycapPk,
                k.KeycapId,
                k.KeycapName,
                m.MakerPk,
                m.MakerName,
                i.ImagePk 
            FROM caps.a_keycap k
            LEFT JOIN caps.a_maker m ON k.MakerPk = m.MakerPk
            LEFT JOIN caps.a_image i ON k.ImagePk = i.ImagePk
            WHERE k.KeycapPk = @KeycapPk;
        `;

        ApiHelper.runApiWrapper(req, res, schema.GET, (api) => {

            ApiHelper.runApiQuery(select_caps, api, (api, result) => {

                ApiHelper.runApiReturnRows(api, result);
            });
        });
    },
    // -----------------------------------------------
    POST: function (req, res) {

        const INSERT_IMAGE = `
            INSERT INTO caps.a_image (ImageUrl)
            VALUES (@ImageUrl);
        `;

        const GET_IMAGE_PK = `
            SELECT MAX(ImagePk) ImagePk
            FROM caps.a_image;
        `;

        const INSERT_KEYCAP = `
            INSERT INTO caps.a_keycap (
                KeycapPk, KeycapId, KeycapName,
                MakerPk, ImagePk)
            VALUES (
                @KeycapPk, @KeycapId, @KeycapName,
                @MakerPk, @ImagePk
            );
        `;

        ApiHelper.runApiWrapper(req, res, schema.POST, (api) => {

            if (api.params['ImageUrl']) {

                ApiHelper.runApiTransaction(api, (api) => {

                    ApiHelper.runApiQuery(INSERT_IMAGE, api, (api, result) => {

                        ApiHelper.runApiQuery(GET_IMAGE_PK, api, (api, result) => {

                            api.params['ImagePk'] = result[0]['ImagePk'];

                            ApiHelper.runApiQuery(INSERT_KEYCAP, api, (api, result) => {

                                ApiHelper.runApiReturnNewPk(api, result);
                            });
                        });
                    });
                });

            } else {
                ApiHelper.runApiQuery(INSERT_KEYCAP, api, (api, result) => {

                    ApiHelper.runApiReturnNewPk(api, result);
                });
            }
        });
    },
    // -----------------------------------------------
    PUT: function (req, res) {

        const FIND_KEYCAP = `
            SELECT * FROM caps.a_keycap
            WHERE KeycapPk = @KeycapPk;
        `;

        const INSERT_IMAGE = `
            INSERT INTO caps.a_image (ImageUrl)
            VALUES (@ImageUrl);
        `;

        const GET_IMAGE_PK = `
            SELECT MAX(ImagePk) ImagePk
            FROM caps.a_image;
        `;

        const UPDATE_KEYCAP = `
            UPDATE caps.a_keycap
            SET KeycapPk = @KeycapPk,
                KeycapId = @KeycapId, 
                KeycapName = @KeycapName,
                MakerPk = @MakerPk, 
                ImagePk = @ImagePk
            WHERE KeycapPk = @KeycapPk;
        `;

        ApiHelper.runApiWrapper(req, res, schema.PUT, (api) => {

            ApiHelper.runApiQuery(FIND_KEYCAP, api, (api, result) => {

                if (!result[0] || !result[0].length == 0)
                    return ApiHelper.sendStatus(api.res, ApiHelper.ApiCode.NOT_FOUND, 'Could not locate record for update.');

                api.oldRecord = result[0];

                if (api.params['ImageUrl']) {

                    ApiHelper.runApiTransaction(api, (api) => {
    
                        ApiHelper.runApiQuery(INSERT_IMAGE, api, (api, result) => {
    
                            ApiHelper.runApiQuery(GET_IMAGE_PK, api, (api, result) => {
    
                                api.params['ImagePk'] = result[0]['ImagePk'];
    
                                ApiHelper.runApiQuery(UPDATE_KEYCAP, api, (api, result) => {
    
                                    ApiHelper.runApiReturn(api, result, api.oldRecord);
                                });
                            });
                        });
                    });
    
                } else {
                    ApiHelper.runApiQuery(UPDATE_KEYCAP, api, (api, result) => {
    
                        ApiHelper.runApiReturn(api, result, api.oldRecord);
                    });
                }
            });
        });
    },
    // -----------------------------------------------
    DELETE: function (req, res) {

        const FIND_KEYCAP = `
            SELECT * FROM caps.a_keycap
            WHERE KeycapPk = @KeycapPk;
        `;

        const DELETE_KEYCAP = `
            DELETE FROM caps.a_keycap
            WHERE KeycapPk = @KeycapPk;
        `;

        ApiHelper.runApiWrapper(req, res, schema.DELETE, (api) => {

            ApiHelper.runApiQuery(FIND_KEYCAP, api, (api, result) => {

                if (!result[0] || !result[0].length == 0)
                    return ApiHelper.sendStatus(api.res, ApiHelper.ApiCode.NOT_FOUND, 'Could not locate record for delete.');

                api.oldRecord = result[0];

                ApiHelper.runApiQuery(DELETE_KEYCAP, api, (api, result) => {

                    ApiHelper.runApiReturn(api, result, api.oldRecord);
                });
            });
        });
    },
};
module.exports = keycapApi;