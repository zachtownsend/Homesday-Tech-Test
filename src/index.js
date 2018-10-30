import $ from 'jquery';
import 'select2';
// import 'bootstrap';
import Chart from 'chart.js';
import 'index.scss';

$(document).ready(() => {
	const $searchBox = $('#search-box');

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
				data.forEach((contributor) => {
					labels.push(contributor.login);
					chartData.push(contributor.contributions);
				});
				chart.data.labels = labels;
				chart.data.datasets[0].data = chartData;
				chart.update();
			});
	};

	$searchBox.on('select2:selecting', (e) => {
		updateData(e.params.args.data.id);
	});
});
