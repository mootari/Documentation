module.exports = function(context, options) {
  return Array.from(context).map(function(entry) {
    const data = {
      '__key': entry[0],
      '__value': entry[1]
    };
    return options.fn(Object.assign(data, entry[1]));
  }).join("\n");
};
