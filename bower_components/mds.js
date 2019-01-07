(function(){
	window["MDS"] = {};

	var dim=numeric.dim,blk=numeric.getBlock,dot=numeric.dot,trans=numeric.transpose,sub=numeric.sub,mul=numeric.mul,
	div=numeric.div,norm2=numeric.norm2,sum=numeric.sum,neg=numeric.neg,inv=numeric.inv,eig=numeric.eig,sqrt=Math.sqrt,
	ab=Math.abs,sq=numeric.sqrt,abs=numeric.abs,ident=numeric.identity,diag=numeric.diag,det=numeric.det,add=numeric.add,
	createT=numeric.t,square=numeric.norm2SquaredV,svd=numeric.svd;

	function central(n){
		var E=[],t=[];
		for(var i=0;i<n;i++)
			t.push(1);
		E[0]=t;
		E=dot(trans(E),E);
		var I=ident(n);
		E=sub(I,div(E,n));
		return E;
	}

	function maxEigV(r){
		var re=r.S,rv=trans(div(add(r.U,r.V),2));
		var max1={n:0,v:re[0]},max2={n:0,v:re[0]};
		for(var i in re){
			if(re[i]>max1.v){
				max1.n=i;
				max1.v=re[i];
			}
		}
		if(max1.n==0)
			max2={n:1,v:re[1]};
		for(var i in re){
			if(i!=max1.n && re[i]>max2.v){
				max2.n=i;
				max2.v=re[i];
			}
		}
		return {n:[max1.n,max2.n],e:[max1.v,max2.v],v:[rv[max1.n],rv[max2.n]]};
	}

	function mdsByDistance(s){
		var d=dim(s);
		if(d[0]!=d[1] || d[0] <=1){
			alert("Incorrect distance matrix!");
			return false;
		}
		var h=central(d[0]);
		for(var i=0;i<d[0];i++)
			s[i][i]=0;
		var g=div(dot(h,s,h),-2);
		var r=maxEigV(svd(g));
		if(r.e[0]<=0 && r.e[1]<=0){
			alert("Incorrect distance matrix!");
			return false;
		}
		var e=diag(r.e);

		return normalize(dot(trans(r.v),sq(e)));
	}

	function getCoordinates(s){
		var td=dim(s), n = td[0], d = td[1];
		var data=trans(s);

		for(var i=0;i<d;i++){
			var r=data[i];
			var Mean=sum(r)/n;
			r=sub(r,Mean);
			var Norm=norm2(r);
			if(Norm!=0){
				data[i]=div(r,Norm);
			}
			else{
				var t_r=Math.sqrt(1/n);
				for(var j=0;j<n;j++)
					data[i][j] = 0;
			}
		}

		var t_svd, t_e, t_v, tt_e = [];
		t_svd = svd(trans(data));//n >= d
		t_v = trans(t_svd.V);
		t_e = t_svd.S;
		tt_e = [];
		t_e = mul(t_e, t_e);
		t_e.forEach(function(tt_d){
			tt_e.push(tt_d);
		});
		tt_e.sort(function(a, b){
			return b-a;
		});
		var t_max1 = t_e.indexOf(tt_e[0]), t_max2 = t_e.indexOf(tt_e[1]);
		if(t_max1 == t_max2){
			t_max2 = t_e.indexOf(tt_e[1], t_max1+1);
		}
		if(t_max1 == -1 || t_max2 == -1){
			console.log("MDS: Error!");
			return;
		}
		else{
			var t_r = [t_v[t_max1], t_v[t_max2]];
			return trans(t_r);
		}
	}

	function mdsByData(s){
		var d=dim(s);
		var data=normalizeData(s)

		var dist=[];
		for(var i=0;i<d[0];i++){
			var k=[];
			dist.push(k);
		}
		for(var i=0;i<d[0];i++){
			dist[i][i]=0;
			for(var j=i+1;j<d[0];j++){
				var k=square(sub(data[i],data[j]));
				dist[i][j]=k;
				dist[j][i]=k;
			}
		}

		return mdsByDistance(dist);
	}

	function normalize(s){
		var a = dim(s), b = s[0][0], c = s[0][0];
		for(var i = 0; i < a[0]; i++){
			for(var j = 0; j < a[1]; j++){
				if(s[i][j] > b)
					b = s[i][j];
				if(s[i][j] < c)
					c = s[i][j];
			}
		}
		return div(sub(s, c), (b-c));
	}

	function normalizeData(s){
		var d=dim(s);
		var data=trans(s);

		for(var i=0;i<d[1];i++){
			var r=data[i];
			var Mean=sum(r)/d[0];
			r=sub(r,Mean);
			var Norm=norm2(r);
			data[i]=div(r,Norm);
		}

		return trans(data);
	}

	window["MDS"]["getCoordinates"]=getCoordinates;
	window["MDS"]["normalizeData"]=normalizeData;
	window["MDS"]["byDistance"]=mdsByDistance;
	window["MDS"]["byData"]=mdsByData;
})();