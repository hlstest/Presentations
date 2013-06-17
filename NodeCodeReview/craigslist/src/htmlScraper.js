var cheerio = require('cheerio');
var moment = require('moment');

function getPostId(element) {
  return element.attr('data-pid');
}

function getPrice(element) {
  return element.find('.price').text();
}
function getTitle(element) {
  return element.find('a').text().trim();
}
function getUrl(element) {
  return element.find('a').attr('href');
}
function getListingDetails(element) {
  return element.find('.itemph').text().trim().replace(/ +-$/, '');
}
function getBedrooms(element) {
  return getListingDetails(element).split(/ *[-\/] */g)[1];
}
function getFootage(element) {
  return getListingDetails(element).split(/ *[-\/] */g)[2];
}
function getHasPicture(element) {
  return !!element.find('.itempx').text().trim().match('pic');
}
exports.scrapeListings = function(text, params) {
  var $ = cheerio.load(text);
  var result = [];
  var date;
  var previousDate;

  var didBreak = false;

  $('#toc_rows .row').each(function(index, element) {
    element = $(element)

    var postId = getPostId(element);

    if (didBreak || (params.postId && postId === params.postId)) {
      didBreak = true;
      return false;
    }

    date = element.find('.itemdate').text().trim();

    if (!date || date == '') {
      var prev = element.prev();
      if (prev && prev[0].name.match(/h/i) && prev.hasClass('ban')) {
        date = prev.text().trim()
      } else {
        date = previousDate;
      }
    }

    var item = {};
    if (date && date != '') {
      item.publishedAt = moment(date).toDate();

      if (!previousDate) {
        previousDate = item.publishedAt;
      }
    }

    item.postId = postId;
    item.title = getTitle(element);
    item.url = getUrl(element);
    item.price = getPrice(element);
    item.bedrooms = getBedrooms(element);
    item.footage = getFootage(element);
    item.hasPic = getHasPicture(element);

    result.push(item);
  });
  return result;
}
