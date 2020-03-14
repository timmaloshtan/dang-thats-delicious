const mongoose = require('mongoose');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const Store = mongoose.model('Store');
const User = mongoose.model('User');

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
  req.body.author = req.user._id;

  const store = await (new Store(req.body)).save();
  
  req.flash('success', `Successfully created ${store.name}! Care to leave a review?`)
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const stores = await Store.find()
  res.render('stores', { title: 'Stores', stores });
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw new Error('You must own a store to edit it!');
  }
};

exports.editStore = async (req, res) => {
  const { storeId } = req.params;
  const store = await Store.findById(storeId);

  confirmOwner(store, req.user);

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
  const store = await Store.findOne({ slug }).populate('author reviews');

  if (!store) {
    return next();
  }

  res.render('store', { store, title: store.name });
};

exports.getStoresByTag = async (req, res) => {
  const currentTag = req.params.tag;

  const tagQuery = currentTag || { $exists: true };

  const [tags, stores] = await Promise.all([
    Store.getTagsList(),
    Store.find({ tags: tagQuery }),
  ]);
  
  res.render('tag', {
    tags,
    stores,
    title: 'Tags',
    currentTag,
  });
};

exports.searchStores = async (req, res) => {
  const stores = await Store
    .find(
      {
        $text: {
          $search: req.query.q,
        }
      },
      {
        score: { $meta: 'textScore' },
      },
    )
    .sort({
      score: { $meta: 'textScore' },
    })
    .limit(5);

  res.json(stores);
};

exports.mapStores = async (req, res) => {
  const coordinates = [
    req.query.lng,
    req.query.lat,
  ].map(parseFloat);

  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates,
        },
        $maxDistance: 8000,
      }
    }
  };

  const stores = await Store.find(query)
    .select('photo name slug description location')
    .limit(10);
  res.json(stores);
};

exports.mapPage = (req, res) => {
  res.render('map', { title: 'Map' });
};

exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map(heart => heart.toString());

  const operator = hearts.includes(req.params.storeId)
    ? '$pull'
    : '$addToSet';
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      [operator]: { hearts: req.params.storeId }
    },
    { new: true },
  )
  
  res.json(user);
};

exports.getHearts = async (req, res) => {
  const stores = await Store.find({
    _id: {
      $in: req.user.hearts,
    }
  });

  res.render('stores', {
    title: 'Hearted stores',
    stores,
  });
};
