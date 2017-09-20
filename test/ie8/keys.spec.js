const React = require('preact')
const { h, render, rerender, Component } = React

describe('keys', () => {
	let scratch;

	beforeAll( () => {
		scratch = document.createElement('div');
		(document.body || document.documentElement).appendChild(scratch);
	});

	beforeEach( () => {
		scratch.innerHTML = '';
	});

	afterAll( () => {
		scratch.parentNode.removeChild(scratch);
		scratch = null;
	});

	// See developit/preact-compat#21
	it('should remove orphaned keyed nodes', () => {
		const root = render((
			<div>
				<div>1</div>
				<li key="a">a</li>
				<li key="b">b</li>
			</div>
		), scratch);

		render((
			<div>
				<div>2</div>
				<li key="b">b</li>
				<li key="c">c</li>
			</div>
		), scratch, root);

    // <div><div>2</div><li>b</li><li>c</li></div>
		expect(nowrap(scratch.innerHTML)).toEqual('<div __n="div"><div __n="div">2</div><li __n="li">b</li><li __n="li">c</li></div>');
	});

	it('should set VNode#key property', () => {
		expect((<div />).key).toBeUndefined()
		expect((<div a="a" />).key).toBeUndefined()
		expect((<div key="1" />).key).toBe('1');
	});
});