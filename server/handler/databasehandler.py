
import tornado.web
from tornado.options import options


# from db.databasemanager import DataBaseManager

import globalvar

# global g_DataBaseManager
# g_DataBaseManager = DataBaseManager()

class DataBaseHandler(tornado.web.RequestHandler):

	def post(self):
		self.set_header('Access-Control-Allow-Origin', "*");
		#'dbName', 'port', 'host'
		#print('[DataBaseHandler] Begin', self.request);
		databasetype = self.get_argument('databasetype')
		dbname = self.get_argument('dbName');
		port = self.get_argument('port');
		host = self.get_argument('host');
		dbconfig = {
			'dbName': dbname,
			'port': int(port),
			'host': host,
		}
		#print('port', type(dbconfig['port']))

		# dbconfig = self.get_argument('dbconfig');
		result = globalvar.g_DataBaseManager.connectDataBase(databasetype, dbconfig);		
		
		# result1 = 'yes';
		# print(' result ', result, type(result), result1, type(result1))
		self.write({
			'sus': result,
		})

	
class TestHandler(tornado.web.RequestHandler):
	def post(self):		
		self.set_header('Access-Control-Allow-Origin', "*")
		# print(" test hello", self.get_argument('databasetype'), self.get_argument('dbName'),
		# 	self.get_argument('port'), self.get_argument('host'));
		ok = '2';
		self.write(ok);