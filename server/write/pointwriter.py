
from db.databasemanager import DataBaseManager
import globalvar

global g_DataBaseManager

class PointWriter():
	def __init__(self):
		print('[PointWriter]: initiate')

	#write the point to currrent db, given the data directories
	def writePoints(self, pointmeta, lidir):
		globalvar.g_DataBaseManager.writePoints(pointmeta, lidir);

