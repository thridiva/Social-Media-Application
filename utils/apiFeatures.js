class APIFeatures {
  constructor(query, queryParameters) {
    this.query = query;
    this.queryParameters = queryParameters;
  }

  // --------------- Filter (duration = 5, duration[gte] = 5, price[lt] = 1000) ---------------

  filter() {
    let queryObj = { ...this.queryParameters };
    let excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((ele) => delete queryObj[ele]);

    let queryParameters = JSON.stringify(queryObj);
    queryParameters = queryParameters.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryParameters));
    return this;
  }

  // --------------- Sorting (Based on price, duration) ---------------

  sort() {
    if (this.queryParameters.sort) {
      let sortBy = this.queryParameters.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  // --------------- Limiting Fields in Output ---------------

  limitFields() {
    if (this.queryParameters.fields) {
      let fields = this.queryParameters.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    }

    this.query = this.query.select("-__v");

    return this;
  }

  // --------------- Pagination ---------------

  paginate() {
    let page = +this.queryParameters.page || 1;
    let limit = +this.queryParameters.limit || 100;
    let skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
