var Punch;

function extractKeywords(text) {
  if (!text) return [];

  return text.
    split(/\s+/).
    filter(function(v) { return v.length > 2; }).
    filter(function(v, i, a) { return a.lastIndexOf(v) === i; });
}

function defineModels(mongoose, fn) {
  var Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

  /**
    * Model: Document
    */
  Punch = new Schema({
    'punchIn': { type: Date, index: true },
    'punchOut': { type: Date, index: true},
    'notes': [String],
    'tags': [String]
  });

  Punch.virtual('id')
    .get(function() {
      return this._id.toHexString();
    });

  Punch.pre('save', function(next) {
    this.keywords = extractKeywords(this.data);
    next();
  });

  mongoose.model('Punch', Punch);

  fn();
}

exports.defineModels = defineModels; 

