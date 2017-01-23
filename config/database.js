
/*module.exports = {
	url : 'mongodb://tst:abc@ds023932.mlab.com:23932/capstone_seo',
	test_url : 'mongodb://tst:abc@ds117849.mlab.com:17849/test-grade-book',
	PORT:process.env.PORT || 8080
};*/


var config = {};

config.mongoURI = {
url : 'mongodb://tst:abc@ds023932.mlab.com:23932/capstone_seo',
  development: 'mongodb://tst:abc@ds023932.mlab.com:23932/capstone_seo',
  test: 'mongodb://tst:abc@ds117849.mlab.com:17849/test-grade-book',
  
  PORT:process.env.PORT || 8080
};

module.exports = config;
