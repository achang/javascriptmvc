TEST.load2 = 0;
TEST.Local = true;
TEST.Localorder = TEST.order++;
if(JMVCTest.TEST_MODE != 'compress')
	include('http://javascriptmvc.com/test/include','load2');
else
	include('load2');