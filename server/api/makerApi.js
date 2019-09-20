const schema = require('../../client/src/schema/maker.js');
const ApiHelper = require('./api-helper.js');

const makerApi = {

    GET_all: function (req, res) {

        const GET_MAKERS = `
            SELECT
                a.MakerPk,
                a.MakerId,
                a.MakerName, 
                a.MakerWebsite,
                a.MakerInstagram,
                a.MakerReddit,
                a.MakerGeekhack,
                i.ImagePk,
                i.ImageURL
            FROM caps.a_maker a
            LEFT JOIN caps.a_image i
                ON a.ImagePk = i.ImagePk;
        `;

        ApiHelper.runApiWrapper(req, res, {}, (api) => {

            ApiHelper.runApiQuery(GET_MAKERS, api, (api, result) => {

                ApiHelper.runApiReturnRows(api, result);
            });
        });
    },

    GET: function (req, res) {

        const GET_MAKERS = `
            SELECT
                a.MakerPk,
                a.MakerId,
                a.MakerName, 
                a.MakerWebsite,
                a.MakerInstagram,
                a.MakerReddit,
                a.MakerGeekhack,
                i.ImagePk,
                i.ImageURL
            FROM caps.a_maker a
            LEFT JOIN caps.a_image i
                ON a.ImagePk = i.ImagePk
            WHERE a.MakerPk = @MakerPk;
        `;

        ApiHelper.runApiWrapper(req, res, schema.GET, (api) => {

            ApiHelper.runApiQuery(GET_MAKERS, api, (api, result) => {

                ApiHelper.runApiReturnRows(api, result);
            });
        });
    },

    POST: function (req, res) {

        const INSERT_IMAGE = `
            INSERT INTO caps.a_image (ImageUrl)
            VALUES (@ImageUrl);
        `;

        const GET_IMAGE_PK = `
            SELECT MAX(ImagePk) ImagePk
            FROM caps.a_image;
        `;

        const INSERT_MAKER = `
            INSERT INTO caps.a_maker (
                MakerId, MakerName, MakerWebsite,
                MakerInstagram, MakerReddit,
                MakerGeekhack, ImagePk)
            VALUES (
                @MakerId, @MakerName, @MakerWebsite,
                @MakerInstagram, @MakerReddit,
                @MakerGeekhack, @ImagePk
            );
        `;

        ApiHelper.runApiWrapper(req, res, schema.POST, (api) => {

            if (api.params['ImageUrl']) {

                ApiHelper.runApiTransaction(api, (api) => {

                    ApiHelper.runApiQuery(INSERT_IMAGE, api, (api, result) => {

                        ApiHelper.runApiQuery(GET_IMAGE_PK, api, (api, result) => {

                            api.params['ImagePk'] = result[0]['ImagePk'];

                            ApiHelper.runApiQuery(INSERT_MAKER, api, (api, result) => {

                                ApiHelper.runApiReturnResult(api, result);
                            });
                        });
                    });
                });

            } else {
                ApiHelper.runApiQuery(INSERT_MAKER, api, (api, result) => {

                    ApiHelper.runApiReturnResult(api, result);
                });
            }
        });
    },

    PUT: function (req, res) {

        const FIND_MAKER = `
            SELECT * FROM caps.a_maker
            WHERE MakerPk = @MakerPk;
        `;
        const UPDATE_MAKER = `
            UPDATE caps.a_maker
            SET MakerId = @MakerId,
                MakerName = @MakerName,
                MakerWebsite = @MakerWebsite,
                MakerInstagram = @MakerInstagram,
                MakerReddit = @MakerReddit,
                MakerGeekhack = @MakerGeekhack
            WHERE MakerPk = @MakerPk;
        `;

        ApiHelper.runApiWrapper(req, res, schema.PUT, (api) => {

            ApiHelper.runApiQuery(FIND_MAKER, api, (api, result) => {

                if (!result[0] || !result[0].length == 0)
                    return ApiHelper.sendStatus(api.res, ApiHelper.ApiCode.NOT_FOUND, 'Could not locate record for update.');

                api.oldRecord = result[0];

                ApiHelper.runApiQuery(UPDATE_MAKER, api, (api, result) => {

                    ApiHelper.runApiReturn(api, result, api.oldRecord);
                });
            });

        });
    },

    DELETE: function (req, res) {

        const FIND_MAKER = `
            SELECT * FROM caps.a_maker
            WHERE MakerPk = @MakerPk;
        `;

        const DELETE_MAKER = `
            DELETE FROM caps.a_maker
            WHERE MakerPk = @MakerPk;
        `;

        ApiHelper.runApiWrapper(req, res, schema.DELETE, (api) => {

            ApiHelper.runApiQuery(FIND_MAKER, api, (api, result) => {

                if (!result[0] || !result[0].length == 0)
                    return ApiHelper.sendStatus(api.res, ApiHelper.ApiCode.NOT_FOUND, 'Could not locate record for delete.');

                api.oldRecord = result[0];

                ApiHelper.runApiQuery(DELETE_MAKER, api, (api, result) => {

                    ApiHelper.runApiReturn(api, result, api.oldRecord);
                });
            });
        });
    }
};
module.exports = makerApi;