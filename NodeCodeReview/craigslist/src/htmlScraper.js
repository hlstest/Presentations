var cheerio = require('cheerio');
var moment = require('moment');

exports.scrapeListings = function(response, params) {
  var $ = cheerio.load(response.text)
    , result = []
    , item, date, previousDate;

  var didBreak = false;

  $('#toc_rows .row').each(function(index, element) {
    element = $(element)

    var link = element.find('a')
      , title = link.text().trim()
      , url = link.attr('href')
      , id;

    id = url.split('/');
    id = id[id.length - 1].replace(/.html$/i, '');

    if (didBreak || (params.postId && id === params.postId)) {
      didBreak = true;
      return false;
    }

    var item = {};

    // date
    date = element.find('.itemdate').text().trim();

    if (!date || date == '') {
      var prev = element.prev();
      if (prev && prev[0].name.match(/h/i) && prev.hasClass('ban')) {
        date = prev.text().trim()
      } else {
        date = previousDate;
      }
    }

    if (date && date != '') {
      item.publishedAt = moment(date).toDate();

      if (!previousDate) {
        previousDate = item.publishedAt;
      }
    }

    var offer = element.find('.itemph').text().trim().replace(/ +-$/, '')
      , offerArray = offer.split(/ *[-\/] */g)
      , price = offerArray[0]
      , bedrooms = offerArray[1]
      , footage = offerArray[2]
      , hasPic = !!element.find('.itempx').text().trim().match('pic');

    item.postId = id;
    item.title = title;
    item.url = url;
    //item.offer = offer;
    item.price = price;
    if (bedrooms) item.bedrooms = bedrooms;
    if (footage) item.footage = footage;
    item.hasPic = hasPic;

    result.push(item);
  });
  return result;
}