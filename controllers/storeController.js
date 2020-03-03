const mongoose = require('mongoose');
const Store = mongoose.model('Store');

mongoose.Promise = global.Promise;

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  req.flash('success', `Successfully created ${store.name}! Care to leave a review?`)
  res.redirect(`/stores/${store.slug}`);
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