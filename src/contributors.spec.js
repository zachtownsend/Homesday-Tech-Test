import Contributors from './contributors';

const App = new Contributors('#search-box', '#chart', '2056009d6e5868b6fd80', 'd726e44a050518a597aa27b3c6314b2e57eb0eca');

test('get correct user endpoint', () => {
	expect(App.getEndpoint('users', 'test')).toBe('https://api.github.com/users/test/repos');
});

test('get correct repo endpoint', () => {
	expect(App.getEndpoint('contributors', 'test/test')).toBe('https://api.github.com/repos/test/test/contributors');
});

test('return false if invalid endpoint type is passed', () => {
	expect(App.getEndpoint('blah', 'test/test')).toBe(false);
});

test('return correct auth data', () => {
	expect(App.authData()).toEqual({
		client_id: '2056009d6e5868b6fd80',
		client_secret: 'd726e44a050518a597aa27b3c6314b2e57eb0eca',
	});
});