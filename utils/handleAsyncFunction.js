module.exports = async (functionRecived, req, res, next) => {
  try {
    await functionRecived(req, res, next);
  } catch (err) {
    next(err);
  }
};
