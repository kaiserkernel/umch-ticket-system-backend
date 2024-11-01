const multer = require('multer');
const path = require('path');

const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/images/avatar'); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const documentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/documents'); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const uploadAvatar = multer({ storage: avatarStorage });
const uploadDocuments = multer({ storage: documentStorage });

module.exports = {
    uploadAvatar,
    uploadDocuments
};
