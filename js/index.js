window.onload = function () {


	var allData = {};

	var URL = "http://www.redleaf.wang";
	var token = document.cookie;

	var courseList;
	var scNum = [];
	var scName =[];

	$.get(URL + "/api/teacher/web/courselist?" + token, function(result){
		if (result.status == 200) {
			courseList = result.data;
			for (a in courseList) {
				scNum.push(a);
				scName.push(courseList[a].course);
				allData[a] = courseList[a].course;
			}
			var course = "";
			for(var i = 0; i < scNum.length ;i++) {
				course += "<li><a>" + scName[i] + "</a></li>"
			}
			$(".courseList").map(function (index,value) {
				value.innerHTML = course;
			})
		}
		
	});

	$.get(URL + "/api/teacher/web/statistics?" + token, function(result){
		if (result.status == 200) {
			$("#w-mark")[0].innerHTML = result.data.week_sign;
			$("#w-no")[0].innerHTML = result.data.week_absence;
			$("#d-mark")[0].innerHTML = result.data.day_sign;
			$("#d-no")[0].innerHTML = result.data.day_absence;
		}
		
	});

	var chart = echarts.init(document.getElementById('flot-chart1'));
	var chartData = {
		xAxis: [],
		data: []
	};
	$.get(URL + "/api/teacher/web/monthstatistics?" + token, function(result){
		if (result.status == 200) {
			for(var i = 0; i<result.data.length; i++) {
				chartData.xAxis.push(i+1);
			}
			chartData.data = result.data;

			var option = {
				tooltip : {
					trigger: 'axis'
				},
				grid: {
					left: '3%',
					right: '4%',
					bottom: '2%',
					top: '8%',
					containLabel: true
				},
				xAxis : [
				{
					type : 'category',
					boundaryGap : false,
					data : chartData.xAxis
				}
				],
				yAxis : [
				{
					type : 'value'
				}
				],
				series : [
				{
					name:'旷到人数',
					type:'line',
					stack: '总人数',
					areaStyle: {normal: {}},
					data: chartData.data
				}
				]
			};
			chart.setOption(option);

		}	
	});

	function changeNum(name) {{
		for (id in allData ) {
			if (allData[id] == name) {
				return id;
			}
		}
	}}

	function changeTag(id,tag) {
		id = "#" + id;
		tag = "#" + tag;
		id = $(id)[0];
		document.querySelector(tag).addEventListener("click",function(e) {
			id.textContent = e.target.textContent;
		})
	}

	changeTag("grade-m","grade-m-list");
	changeTag("scNum-m","scNum-m-list");
	changeTag("grade","grade-list");
	changeTag("scNum","scNum-list");
	changeTag("weekSearch","weekSearch-list");


	function objLength(obj) {
		var length = 0;
		for(i in obj) {
			length++;
		}
		return length;
	}



	$("#ok-m").click(function () {
		$.get(URL + "/api/teacher/web/termstatistics?" + token 
			+ "&grade=" + Number($("#grade-m")[0].textContent)
			+ "&scNum=" + changeNum($("#scNum-m")[0].textContent)
			, function(result){
		if (result.status == 200) {
				var seriesData= [];
				var jxb = [];
				var xData = [];
				var max = 0;
				var myChart = echarts.init(document.getElementById('lineChart'));
				for(key in result.data) {
					if (objLength(result.data[key]) > max ) {
						max = objLength(result.data[key])
					}
				}

				for(key in result.data) {
					var course = {
						areaStyle: {normal: {}},
					};
					course.name = "教学班" + key + "旷到人数";
					course.type = "line";
					course.stack = "总人数";
					course.data = [];
					if (objLength(result.data[key]) < max) {
						for(var i = objLength(result.data[key]); i< max ; i++ ) {
							result.data[key][i*1000] = 0;
						}
					}
					for(i in result.data[key]) {
						course.data.push(result.data[key][i]);
					}
					seriesData.push(course);
					jxb.push("教学班" + key + "旷到人数");
				}

				for(var i = 0; i < max ; i ++) {
					xData.push("第" + (i+1) + "节课");
				}
				var option = {
					tooltip : {
						trigger: 'axis'
					},
					legend: {
						data:jxb,
						itemWidth: 15,
						itemHeight: 10,
					},
					toolbox: {
						feature: {
							saveAsImage: {}
						}
					},
					grid: {
						left: '3%',
						right: '4%',
						bottom: '3%',
						top: '15%',
						containLabel: true
					},
					xAxis : [
					{
						type : 'category',
						boundaryGap : false,
						data : xData
					}
					],
					yAxis : [
					{
						type : 'value'
					}
					],
					series : seriesData
				};
				myChart.setOption(option);
			}
		});
	})

	var page = 1;
	day = false;
	month = false;
	var course = "";
	var search;

	function getStu() {
		course = "";
		search = "";
		if ($("#searchBox")[0].value) {
			if (isNaN($("#searchBox")[0].value) == true) {
				search = "&stuName=" + $("#searchBox")[0].value;
			} else if (isNaN($("#searchBox")[0].value) == false) {
				search = "&stuNum=" + $("#searchBox")[0].value;
			} else {
				search = "";
			}
		}
		$.get(URL + "/api/teacher/web/stulist?" + token 
			+ "&page=" + page 
			+ "&per_page=" + 20 
			+ search 
			+ "&week=" + (isNaN(Number($("#weekSearch")[0].textContent))?1:Number($("#weekSearch")[0].textContent))
			+ "&grade=" + Number($("#grade")[0].textContent)
			+ "&scNum=" + changeNum($("#scNum")[0].textContent)
			+ "&today=" + day 
			+ "&this_month=" + month 
			+ "&status=" + 2 
			, function(result){
			if (result.status == 200) {
				if(result.data.data.length == 0) {
					alert("没有了");
				}
				for(var i = 0; i < result.data.data.length ;i++) {
					course = course + "<tr id = " + result.data.data[i].ccid + "><td>" + result.data.data[i].stuName + 
					"</td><td><span class='pie'>" + result.data.data[i].class + 
					"</span></td><td>" + result.data.data[i].stuNum + 
					"</td><td>" + result.data.data[i].created_at + 
					"</td><td><button id='3' type='button' class='btn btn-primary btn-xs'>请假</button></td></tr>"
				}
				$("tbody")[0].innerHTML = course;
				$("tr").click(function(e) {
					if (e.currentTarget.id && e.target.id) {
						$.ajax({
							url: URL + "/api/teacher/web/stu?" + token 
								+ "&ccid=" + e.currentTarget.id 
								+ "&status=" + e.target.id ,
							type: 'PUT',
							success: function(response) {
								$("#"+e.currentTarget.id)[0].innerHTML = "";
							}
						});
					}
				})
			}
		});
	};


	$("#day").click(function () {	
		day = true;
		month = false;
		getStu();
	})
	$("#week").click(function () {
		day = false;
		month = false;
		getStu();
	})
	$("#month").click(function () {
		day = true;
		month = true;
		getStu();
	})

	$("#more").click(function (e) {
		course = "";
		page++;
		$.get(URL + "/api/teacher/web/stulist?" + token 
			+ "&page=" + page 
			+ "&per_page=" + 20 
			+ "&week=" + (isNaN(Number($("#weekSearch")[0].textContent))?1:Number($("#weekSearch")[0].textContent))
			+ "&grade=" + Number($("#grade")[0].textContent)
			+ "&scNum=" + changeNum($("#scNum")[0].textContent)
			+ "&today=" + day 
			+ "&this_month=" + month 
			+ "&status=" + 2 
			, function(result){
			if (result.status == 200) {
				if(result.data.data.length == 0) {
					alert("没有了");
					page --;
				}
				for(var i = 0; i < result.data.data.length ;i++) {
					course = course + "<tr id = " + result.data.data[i].ccid + "><td>" + result.data.data[i].stuName + 
					"</td><td><span class='pie'>" + result.data.data[i].class + 
					"</span></td><td>" + result.data.data[i].stuNum + 
					"</td><td>" + result.data.data[i].created_at + 
					"</td><td><button id='3' type='button' class='btn btn-primary btn-xs'>请假</button></td></tr>"
				}
				$(course).appendTo("tbody");
				$("tr").click(function(e) {
					if (e.currentTarget.id && e.target.id) {
						$.ajax({
							url: URL + "/api/teacher/web/stu?" + token 
								+ "&ccid=" + e.currentTarget.id 
								+ "&status=" + e.target.id ,
							type: 'PUT',
							success: function(response) {
								$("#"+e.currentTarget.id)[0].innerHTML = "";
							}
						});
					}
				})
			}
			
		});
	})

	$("#search").click(function (e) {
		getStu();
	})

	$("#ok-list").click(function (e) {
		getStu();
	})

	$("#out").click(function(e) {
		search = "";
		if ($("#searchBox")[0].value) {
			if (isNaN($("#searchBox")[0].value) == true) {
				search = "&stuName=" + $("#searchBox")[0].value;
			} else if (isNaN($("#searchBox")[0].value) == false) {
				search = "&stuNum=" + $("#searchBox")[0].value;
			} else {
				search = "";
			}
		}
		var url = URL + "/api/teacher/web/stulist/excel?" + token 
			+ "&page=" + page 
			+ "&per_page=" + 20 
			+ search 
			+ "&week=" + (isNaN(Number($("#weekSearch")[0].textContent))?1:Number($("#weekSearch")[0].textContent))
			+ "&grade=" + Number($("#grade")[0].textContent)
			+ "&scNum=" + changeNum($("#scNum")[0].textContent)
			+ "&today=" + day 
			+ "&this_month=" + month 
			+ "&status=" + 2 
		window.location = url; 
	})

	function getTime() {
		var time = new Date();
		var now = time.toLocaleDateString().replace(/\//g,".");
		return now; 
	}
	$("#time")[0].innerHTML= getTime();
	$("#time2")[0].innerHTML= getTime();
}