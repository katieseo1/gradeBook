const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../server.js');

const should = chai.should();
const app=server.app;
chai.use(chaiHttp);


/*describe('Home page', function() {
  it('should display 200', function() {
       return chai.request(app)
       .get('/')
       .then(function(res) {
         res.should.have.status(200);
         });
       });
});
*/
