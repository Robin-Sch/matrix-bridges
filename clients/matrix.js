const { createClient } = require("matrix-js-sdk");

const {
    MATRIX_BOT_USERNAME,
    MATRIX_BOT_PASSWORD,
    MATRIX_HOMESERVER,
} = process.env;

const MatrixClient = createClient(MATRIX_HOMESERVER);

let PREPARED = false;

MatrixClient.login("m.login.password", {"user": MATRIX_BOT_USERNAME, "password": MATRIX_BOT_PASSWORD}).then(() => {
    MatrixClient.once('sync', function(state, prevState, res) {
        if (state === 'PREPARED') {
            PREPARED = true;
        };
    });

    MatrixClient.startClient();
});

const IsMatrixClientPrepared = () => {
    return PREPARED;
}

const replyMatrix = async (room, message, images = []) => {
    for(let i = 0; i < images.length; i++) {
        const image = images[i];

        const uploadResponse = await MatrixClient.uploadContent(image, { rawResponse: false, type: 'png' });
        const matrixUrl = uploadResponse.content_uri;

        MatrixClient.sendImageMessage(room, matrixUrl, {}, '', () => { return; });
    }

    if (message) return MatrixClient.sendMessage(room, { "body": message, "msgtype": "m.notice" }, '', () => { return; });
}

module.exports = { MatrixClient, IsMatrixClientPrepared, replyMatrix };