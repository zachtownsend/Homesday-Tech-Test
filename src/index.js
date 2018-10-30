import $ from 'jquery';
import 'select2';
import Chart from 'chart.js';
import 'nice-color-palettes';
import 'index.scss';

$(document).ready(() => {
	const $searchBox = $('#search-box');
	const colors = require('nice-color-palettes');

	function* getColor() {
		var groupIndex = 0;
		var index = 0;

		if (typeof colors[groupIndex] === undefined) {
			groupIndex = 0;
		}

		if (typeof [groupIndex][index] === undefined) {
			index = 0;
			groupIndex++;
		}

		console.log(index, groupIndex);

		yield colors[groupIndex][index++];
	}

	const colorGen = getColor();

	for (var i = 50 - 1; i >= 0; i--) {
		console.log(colorGen.next());
	}

	console.log(getColor().next());

	$searchBox.select2({
		ajax: {
			url: (params) => {
				return `https://api.github.com/users/${params.term}/repos?client_id=2056009d6e5868b6fd80&client_secret=d726e44a050518a597aa27b3c6314b2e57eb0eca`;
			},
			processResults: function (data) {
				const formattedData = data.map((item) => {
					return {
						'id': item.full_name,
						'text': item.name,
					};
				});
				return {
					results: formattedData
				};
			},
		},
	});

	const ctx = $('#chart');
	const chart = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: [],
			datasets: [{
				label: 'Contributors',
				data: [],
				borderWidth: 1
			}]
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true
					}
				}]
			}
		}
	});

	const updateData = (repo) => {
		$.ajax({
			method: 'GET',
			url: `https://api.github.com/repos/${repo}/contributors`,
			data: {
				client_id: '2056009d6e5868b6fd80',
				client_secret: 'd726e44a050518a597aa27b3c6314b2e57eb0eca',
			},
		})
			.done((data) => {
				const labels = [];
				const chartData = [];
				const barColors = [];
				data.forEach((contributor) => {
					labels.push(contributor.login);
					chartData.push(contributor.contributions);
					const c = getColor();
					console.log(colorGen, colorGen.next());
					barColors.push(c.next().value);
				});
				chart.data.labels = labels;
				chart.data.datasets[0].data = chartData;
				chart.data.datasets[0].backgroundColor = barColors;
				chart.update();
			});
	};

	$searchBox.on('select2:selecting', (e) => {
		updateData(e.params.args.data.id);
	});
});
