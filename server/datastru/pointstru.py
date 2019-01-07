class Point():
	def __init__(self):
		print('[Point] initiate');
		self.m_Id = {};
		self.m_PosX = {}
		self.m_PosY = {}
		self.m_PosZ = {}
		self.m_T = {}
		self.m_liAbsAttr = [];
	def getPosX(self):
		return self.m_PosX;
	def getT(self):
		return self.m_T;
	def getAttr(self, attr_index):
		# TODO
		return None;

class PointMeta():
	def __init__(self):
		self.m_DataSetName = "";
		self.m_DataDescript = "";
		self.m_PosName = [];
		self.m_TimeName = [];
		self.m_liAtrrName = [];
	def getAttrNames(self):
		# TODO
		return None;
	def getAttrIndex(self, attr_name):
		# TODO
		return None