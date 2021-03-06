mongodb = require "mongodb"
tracking = require "../tracking"
emailer = require "../emailer"
{flow} = require "nue"
{as} = require "nue"

module.exports = (test) ->
  connect = ->
    mongodb.connect "mongodb://localhost/awaitdefer", this.async(as(1))

  lookupOrder = (db) ->
    orderId = 1
    this.data.db = db
    db.collection("orders").findOne orderId, this.async(as(1))

  queryEmailDetails = (order) ->
    this.data.order = order
    this.data.db.collection("orders").findOne order.customer.id, this.async(as(1))
    tracking.track order.trackingId, this.async(as(1))

  sendEmail = (user, trackingInformation) ->
    this.data.db.close()
    message =
      subject: "Order: " + this.data.order.name
      email: user.email
      body: "Tracking: " + trackingInformation
    emailer.sendEmail message, this.async()

  end = ->
    throw this.err if this.err
    test.done()

  flow(
        connect
        lookupOrder
        queryEmailDetails
        sendEmail
        end
      )()