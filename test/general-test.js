var portastic = require('../');
var helpers = require('./fixtures/helpers');
var expect = require('chai').expect;
var bluebird = require('bluebird');

describe('General testing', function() {

  describe('#find', function() {

    it('Should find open ports', function() {
      return portastic.find({
          min: 8000,
          max: 8001
        })
        .then(function(ports) {
          expect(ports).to.have.length(2);
          expect(ports).to.contain(8000);
          expect(ports).to.contain(8001);
        });
    });

    it('Should not return closed ports', function() {

      return helpers.autoClose(8000, function() {
        return portastic.find({
            min: 8000,
            max: 8001
          })
          .then(function(ports) {
            expect(ports).to.be.eql([8001]);
          });
      });
    });

    it('Should return the specified amount of ports', function() {

      return portastic.find({
          min: 8000,
          max: 8001,
          retrieve: 1
        })
        .then(function(ports) {
          expect(ports).to.have.length(1);
        });
    });

  });

  describe('#test', function() {
    it('Should be able to test ports', function() {
      return portastic.test(8000)
        .then(function(ports) {
          expect(ports).to.be.eql([8000]);
        });
    });

    if ('Should not return ports in use', function() {
      return helpers.autoClose(8000, function() {
        return portastic.test([8000, 8001])
          .then(function(ports) {
            expect(ports).to.be.eql([8001]);
          });
      });
    });
  });

  describe('#monitor', function() {
    it('Should emit events for every state change', function() {
      var events = [];
      var monitor = new portastic.Monitor([8000, 8001]);
      helpers.captureEvents(monitor, events);

      return helpers.autoClose([8000, 8001], function() {
          return bluebird.resolve()
            .delay(500)
            .then(function() {
              return monitor.stop();
            });
        })
        .delay(500)
        .then(function() {
          console.log(events);
          expect(events).to.have.length(6);
          events.forEach(function(event, i) {
            if (i <= 1)
              expect(event[0]).to.be.equal('open');

            if (i > 1 && i <= 3)
              expect(event[0]).to.be.equal('close');

            if (i >= 4)
              expect(event[0]).to.be.equal('open');
          });
        });
    });
  });
});