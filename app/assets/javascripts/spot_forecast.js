try {
	var infosList = gon.infos;
} catch(err) {
}
var ready = function() {

	var sf = new Array();
	var currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	// Create Spot Forecasts
	$("canvas.spot_forecast").each(function(index) {
		var page = $(this).attr('data-page');
		var infos = infosList;
		var height_scale = 32;

		var canvas = $(this)[0];
		var context = canvas.getContext("2d");

		var height_max = 6;
		// Feet
		// Pixels

		var chartX_indent = 0.5;
		var chartY_indent = 4.5;

		var time_scale = 19.5;
		var time_max = 24;
		var time_text_indent = 0;
		var iterator_step = 1;
		var sizeMin = 10;
		var sizeMax = 0;
		var data = [];

		page = page - 1;
		currentDate.setDate(currentDate.getDate() + page);

		for (var i = 0; i < infos.length; i++) {
			var tempDate = new Date(infos[i].day * 1000);
			tempDate.setHours(0, 0, 0, 0);

			if (tempDate.getTime() == currentDate.getTime()) {
				var tempData = {
					size_high : infos[i].size_max,
					size_low : infos[i].size_min,
					swell_rating : infos[i].swell_rating
				};
				data.push(tempData);
				if (infos[i].size_min < sizeMin) {
					sizeMin = infos[i].size_min;
				}
				if (infos[i].size_max > sizeMax) {
					sizeMax = infos[i].size_max;
				}
			}
		}

		while (sizeMax >= height_max) {
			height_max += 3;
		}

		if ((sizeMax >= 6)) {
			if (height_max < 13) {
				switch(height_max) {
				case 7:
					height_scale = 8;
					break;
				case 8:
					height_scale = 8;
					break;
				case 9:
					height_scale = 7;
					break;
				case 10:
					height_scale = 6;
					break;
				case 11:
					height_scale = 6;
					break;
				case 12:
					height_scale = 6;
					break;
				}
			} else {
				if (height_max <= 15) {
					height_scale = 5;
				} else {
					height_scale = 3;
				}
			}
			height_scale = height_scale * 2.5;
		}
		// GRID: Height Bars

		for (var i = 0; i < (height_max + 1); i++) {
			if (i % 3 == 0) {
				context.moveTo(chartX_indent, height_max * height_scale - i * height_scale + chartY_indent);
				context.strokeStyle = "rgba(204,204,204,1)";
				context.lineTo(time_max * time_scale + chartX_indent, height_max * height_scale - i * height_scale + chartY_indent);
				context.stroke();
				if (i != 0) {
					context.font = "11px Arial";
					context.textAlign = "left";
					context.textBaseline = "middle";
					context.fillText(i + "ft", time_max * time_scale + chartX_indent + 1, height_max * height_scale - i * height_scale + chartY_indent);
				}

			}
		}

		// GRID: Time Bars
		for (var i = 0; i < (time_max + 1); i++) {
			if (i % 6 == 0) {
				context.moveTo(i * time_scale + chartX_indent, chartY_indent);
				context.lineTo(i * time_scale + chartX_indent, height_max * height_scale + chartY_indent);
				context.stroke();

				if (i != 0 && i != 24) {
					switch(i) {
					case 6:
						timeText = "6am";
						break;
					case 12:
						timeText = "Noon";
						break;
					case 18:
						timeText = "6pm";
						break;
					}

					context.font = "11px Arial";
					context.textAlign = "center";
					context.textBaseline = "top";
					context.fillText(timeText, i * time_scale + chartX_indent + time_text_indent, height_max * height_scale + chartY_indent + 2);
				}
			}
		}

		// CHART FILL

		// Top

		context.beginPath();
		context.moveTo(chartX_indent, (height_max - data[0].size_high) * height_scale + chartY_indent);

		for (var i = 0; i < data.length; i++) {
			var x = i * 58.5 + chartX_indent;
			var y = (height_max - data[i].size_high) * height_scale + chartY_indent;
			if (i == data.length - 1) {
				var xPlusOne = (i+1) * 58.5 + chartX_indent;
				var yPlusOne = (height_max - data[i].size_high) * height_scale + chartY_indent;

			} else {
				var xPlusOne = (i + iterator_step) * 58.5 + chartX_indent;
				var yPlusOne = (height_max - data[i + 1].size_high) * height_scale + chartY_indent;
			}
			var xc = (x + xPlusOne) / 2;
			var yc = (y + yPlusOne) / 2;

			context.quadraticCurveTo(x, y, xc, yc);
		}

		context.lineTo(time_max * time_scale + chartX_indent, (height_max - data[data.length - 1].size_high) * height_scale + chartY_indent);

		// Bottom

		context.lineTo(time_max * time_scale + chartX_indent, height_max * height_scale + chartY_indent);
		context.lineTo(chartX_indent, height_max * height_scale + chartY_indent);

		// Fill

		var grd = context.createLinearGradient(0, 0, time_max * 58.5, 0);

		grd.addColorStop(0, getFillColor(data[0].swell_rating));
		grd.addColorStop(0 + (1 / time_max) / 2, getFillColor(data[0].swell_rating));

		for (var i = 1; i < data.length; i++) {
			grd.addColorStop(i / time_max - (1 / time_max) / 2, getFillColor(data[i].swell_rating));
			grd.addColorStop(i / time_max + (1 / time_max) / 2, getFillColor(data[i].swell_rating));
		}

		grd.addColorStop(1 - (1 / time_max) / 2, getFillColor(data[data.length - 1].swell_rating));
		grd.addColorStop(1, getFillColor(data[data.length - 1].swell_rating));

		context.fillStyle = grd;

		context.fill();

		// CHART LINE

		context.beginPath();
		context.strokeStyle = "rgba(0, 0, 0, 1)";
		context.lineWidth = 2;
		context.lineJoin = 'round';
		context.lineCap = 'butt';

		// High Curve

		context.beginPath();
		context.moveTo(chartX_indent, (height_max - data[0].size_high) * height_scale + chartY_indent);
						
		for (var i = 0; i < data.length; i++) {
			var x = i * 58.5 + chartX_indent;
			var y = (height_max - data[i].size_high) * height_scale + chartY_indent;
			if (i == data.length - 1) {
				var xPlusOne = (i+1) * 58.5 + chartX_indent;
				var yPlusOne = (height_max - data[i].size_high) * height_scale + chartY_indent;

			} else {
				var xPlusOne = (i + iterator_step) * 58.5 + chartX_indent;
				var yPlusOne = (height_max - data[i + 1].size_high) * height_scale + chartY_indent;
			}
			var xc = (x + xPlusOne) / 2;
			var yc = (y + yPlusOne) / 2;

			context.quadraticCurveTo(x, y, xc, yc);
		}
		context.lineTo(time_max * time_scale + chartX_indent, (height_max - data[data.length - 1].size_high) * height_scale + chartY_indent);
		context.stroke();

	});

};

function getFillColor(swell_rating) {
	var theColor = "rgba(0,0,0, 0.45)";

	if (swell_rating == '0') {
		theColor = "rgba(0,0,0, 0.8)";
	} else if (swell_rating == '1') {
		theColor = "rgba(94,94,94, 0.8)";
	} else if (swell_rating == '2') {
		theColor = "rgba(197,213,219, 0.8)";
	} else if (swell_rating == '3') {
		theColor = "rgba(154,202,219, 0.8)";
	} else if (swell_rating == '4') {
		theColor = "rgba(88,184,219, 0.8)";
	} else if (swell_rating == '5') {
		theColor = "rgba(0,161,219, 0.8)";
	}

	return theColor;

}


$(document).ready(ready);
$(document).on('page:load', ready);
