const mongoose = require('mongoose');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const Store = mongoose.model('Store');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');

    if (isPhoto) {
      next(null, true);
    } else {
      next({
        message: "That file type is not allowed!",
      }, false);
    }
  },
};

mongoose.Promise = global.Promise;

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const extension = req.file.mimetype.split('/')[1];

  req.body.photo = `${uuid.v4()}.${extension}`;

  // Resizing
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);

  next();
};

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  req.flash('success', `Successfully created ${store.name}! Care to leave a review?`)
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const stores = await Store.find()
  res.render('stores', { title: 'Stores', stores });
};

exports.editStore = async (req, res) => {
  const { storeId } = req.params;
  const store = await Store.findById(storeId);

  // @TODO: confirm the current user is the owner of the store

  res.render('editStore', {
    title:  'Edit Store',
    store,
  });
};

exports.updateStore = async (req, res) => {
  const { storeId } = req.params;
  req.body.location.type = 'Point';
  const store = await Store.findByIdAndUpdate(
    storeId,
    req.body,
    {
      new: true, // return the new store
      runValidators: true,
    }
  ).exec();
  req.flash('success', `Successfully updated ${store.name} store! <a href="/stores/${store.slug}">View Store →</a>`);
  res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoreBySlug = async (req, res, next) => {
  const { slug } = req.params;
  const store = await Store.findOne({ slug });

  if (!store) {
    return next();
  }

  res.render('store', { store, title: store.name });
};

exports.getStoresByTag = async (req, res) => {
  const tags = await Store.getTagsList();
  const currentTag = req.params.tag;
  res.render('tag', {
    tags,
    title: 'Tags',
    currentTag,
  });
};