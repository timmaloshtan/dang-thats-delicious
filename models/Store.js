const mongoose = require('mongoose');
const slugs = require('slugs');

mongoose.Promise = global.Promise;

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please, enter a store name!',
  },
  slug: String,
  description: {
    type: String,
    trim: true,
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply an address!',
    },
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
});

// Define our indexes
storeSchema.index({
  name: 'text',
  description: 'text',
});

storeSchema.index({
  location: '2dsphere',
})

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    return next();
  }
  this.slug = slugs(this.name);

  const slugRegEx = new RegExp(`${this.slug}(-\d+)?$`, 'i');

  const storesWithSlug = await this.constructor.find({
    slug: slugRegEx,
  })
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length}`;
  }
  next();
  // @TODO Unique slugs
});

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

storeSchema.statics.getTopStores = function() {
  return this.aggregate([
    // Lookup stores and populate reviews
    { $lookup: {
      from: 'reviews',
      localField: '_id',
      foreignField: 'store',
      as: 'reviews'
    }},
    // Filter stores that have 2 or more reviews
    { $match: {
      'reviews.1': { $exists: true },
    }},
    // Add the average reveiew field
    { $project: {
      photo: '$$ROOT.photo',
      name: '$$ROOT.name',
      reviews: '$$ROOT.reviews',
      slug: '$$ROOT.slug',
      averageRating: {
        $avg: '$reviews.rating'
      }
    }},
    // Sort it by average rating
    { $sort: {
      averageRating: -1
    }},
    // Limit to 10
    { $limit: 10 },
  ]);
};

storeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'store',
});

function autopopulate(next) {
  this.populate('reviews');
  next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema);