const QRCode = require('qrcode');

exports.generate = async (text) => {
    try {
        return await QRCode.toDataURL(text);
    } catch (err) {
        throw new Error('QR code generation failed');
    }
};
