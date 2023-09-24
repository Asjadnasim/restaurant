const multer = require('multer');
const uuid = require('uuid').v4;

const upload = multer({
  storage: multer.diskStorage({
    destination: 'product-data/images',
    filename: function (req, file, cb) {
      cb(null, uuid() + '-' + file.originalname);
    }
  })
});

const configureMulterMiddleware = upload.single('image');

module.exports = configureMulterMiddleware;