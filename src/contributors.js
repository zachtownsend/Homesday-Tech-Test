import $ from 'jquery';
import _ from 'lodash';
import 'select2';
import Chart from 'chart.js';
import 'nice-color-palettes';

export default class Contributors {
	constructor(searchBoxId, chartId, client_id = false, client_secret = false) {
		this.$search = $(searchBoxId);
		this.$chart = $(chartId);
		this.colors = require('nice-color-palettes');
		this.client_id = client_id;
		this.client_secret = client_secret;

		this.initialiseSearch();
		this.initialiseChart();
		this.__bindEvents();
	}

	/**
	 * Colour generator
	 */
	*getColor(colors) {
		const yieldColors = [];

		colors.forEach((colorSet) => {
			colorSet.forEach((color) => {
				yieldColors.push(color);
			});
		});

		for (var i = yieldColors.length - 1; i >= 0; i--) {
			yield yieldColors[i];
		}
	}

	/**
	 * Dynamically generate the correct API endpoint
	 * @param  {string} name Name of the endpoint
	 * @param  {string} term The passed term to search for
	 * @return {string}      The API endpoint
	 */
	getEndpoint(name, term) {
		if (_.isUndefined(term)) {
			return false;
		}

		switch(name) {
		case 'users':
			return `https://api.github.com/users/${term}/repos`;

		case 'contributors':
			return `https://api.github.com/repos/${term}/contributors`;

		default:
			return false;
		}
	}

	/**
	 * Initialised the search functionality
	 * @return {null}
	 */
	initialiseSearch() {
		if (this.$search.length) {
			this.$search.select2({
				ajax: {
					url: (params) => {
						return this.getEndpoint('users', params.term);
					},
					data: this.authData(),
					processResults: (data) => {
						if (_.isArray(data)) {
							return {
								results: data.map((item) => {
									return {
										'id': item.full_name,
										'text': item.name,
									};
								})
							};
						}

						return false;
					},
				},
			});
		}
	}

	/**
	 * Initialises the dynamic chart
	 * @return {null}
	 */
	initialiseChart() {
		if(this.$chart.length) {
			this.initialChartSettings = {
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
			};

			this.chart = new Chart(this.$chart, this.initialChartSettings);
		}
	}

	/**
	 * Returns the authentication data, if provided
	 * @return {object literal} The authentication data represented as an object
	 */
	authData() {
		const {
			client_id,
			client_secret,
		} = this;

		if (_.isString(client_id) && _.isString(client_secret)) {
			return {
				client_id,
				client_secret,
			};
		}

		return false;
	}

	/**
	 * Handles functionality when a repo is selected
	 * @param  {string} term The term of the selected item
	 * @return {null}
	 */
	onRepoSelect(term) {
		$.ajax({
			method: 'GET',
			url: this.getEndpoint('contributors', term),
			data: this.authData(),
		})
			.done((data, textStatus) => {
				switch(textStatus) {
				case 'success':
					this.updateChart(data);
					break;

				case 'nocontent':
					this.resetChart();
					break;
				}
			});
	}

	/**
	 * Updates the chart with new data
	 * @param  {object} data Object of new data
	 * @return {null}
	 */
	updateChart(data) {
		const {
			chart,
			getColor,
		} = this;

		const generateColor = getColor(this.colors);

		const labels = [];
		const chartData = [];
		const barColors = [];

		data.forEach((contributor) => {
			labels.push(contributor.login);
			chartData.push(contributor.contributions);
			barColors.push(generateColor.next().value);
		});

		chart.data.labels = labels;
		chart.data.datasets[0].data = chartData;
		chart.data.datasets[0].backgroundColor = barColors;
		chart.update();
	}

	/**
	 * Reinitialises the chart
	 * @return {null}
	 */
	resetChart() {
		const { chart } = this;

		chart.destroy();
		this.initialiseChart();
	}

	/**
	 * Binds the events
	 * @return {null}
	 */
	__bindEvents() {
		this.$search.on('select2:selecting', (e) => {
			this.onRepoSelect(e.params.args.data.id);
		});
	}
}