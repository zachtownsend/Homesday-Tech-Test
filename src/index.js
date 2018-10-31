import $ from 'jquery';
import Contributors from './contributors';
import 'index.scss';

$(document).ready(() => {
	new Contributors('#search-box', '#chart', '2056009d6e5868b6fd80', 'd726e44a050518a597aa27b3c6314b2e57eb0eca');
});
