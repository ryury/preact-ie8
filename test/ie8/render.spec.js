const React = require('preact')
const { h, render, Component } = React

function getAttributes(node) {
	let attrs = {};
	for (let i=node.attributes.length; i--; ) {
		if (!/^__\w+$/.test(node.attributes[i].name)) {
			attrs[node.attributes[i].name] = node.attributes[i].value;
		}
	}
	return attrs;
}

describe('render()', () => {
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
  
  it('should create empty nodes (<* />)', () => {
		render(<div />, scratch);
		expect(scratch.childNodes.length).toBe(1)
		expect(scratch.childNodes[0].nodeName).toBe('DIV')

		scratch.innerHTML = '';

		render(<span />, scratch);
		expect(scratch.childNodes.length).toBe(1)
		expect(scratch.childNodes[0].nodeName).toBe('SPAN')

		scratch.innerHTML = '';

		render(<foo />, scratch);
		render(<x-bar />, scratch);
		expect(scratch.childNodes.length).toBe(2)
		expect(scratch.childNodes[0].nodeName).toBe('foo')
		expect(scratch.childNodes[1].nodeName).toBe('x-bar')
	});

	it('should nest empty nodes', () => {
		render((
			<div>
				<span />
				<foo />
				<x-bar />
			</div>
		), scratch);

		expect(scratch.childNodes.length).toBe(1)
		expect(scratch.childNodes[0].nodeName).toBe('DIV');

		let c = scratch.childNodes[0].childNodes;
		expect(c.length).toBe(3);
		expect(c[0].nodeName).toBe('SPAN');
		expect(c[1].nodeName).toBe('foo');
		expect(c[2].nodeName).toBe('x-bar');
	});

	it('should not render falsey values', () => {
		render((
			<div>
				{null},{undefined},{false},{0},{NaN}
			</div>
		), scratch);

		expect(scratch.firstChild.innerHTML).toBe(',,,0,NaN');
	});

	it('should not render null', () => {
		render(null, scratch);
		expect(scratch.innerHTML).toEqual('');
	});

	it('should not render undefined', () => {
		render(undefined, scratch);
		expect(scratch.innerHTML).toEqual('');
	});

	it('should not render boolean true', () => {
		render(true, scratch);
		expect(scratch.innerHTML).toEqual('');
	});

	it('should not render boolean false', () => {
		render(false, scratch);
		expect(scratch.innerHTML).toEqual('');
	});

	it('should render NaN as text content', () => {
		render(NaN, scratch);
		expect(scratch.innerHTML).toEqual('NaN');
	});

	it('should render numbers (0) as text content', () => {
		render(0, scratch);
		expect(scratch.innerHTML).toEqual('0');
	});

	it('should render numbers (42) as text content', () => {
		render(42, scratch);
		expect(scratch.innerHTML).toEqual('42');
	});

	it('should render strings as text content', () => {
		render('Testing, huh! How is it going?', scratch);
		expect(scratch.innerHTML).toEqual('Testing, huh! How is it going?');
	});

	it('should clear falsey attributes', () => {
		let root = render((
			<div anull="anull" aundefined="aundefined" afalse="afalse" anan="aNaN" a0="a0" />
		), scratch);

		render((
			<div anull={null} aundefined={undefined} afalse={false} anan={NaN} a0={0} />
		), scratch, root);

		expect(getAttributes(scratch.firstChild)).toEqual({
			a0: '0',
			anan: 'NaN'
		});

		scratch.innerHTML = '';

		render((
			<div anull={null} aundefined={undefined} afalse={false} anan={NaN} a0={0} />
		), scratch);

		expect(getAttributes(scratch.firstChild)).toEqual({
			a0: '0',
			anan: 'NaN'
		});
	});

	it('should clear falsey input values', () => {
		let root = render((
			<div>
				<input value={0} />
				<input value={false} />
				<input value={null} />
				<input value={undefined} />
			</div>
		), scratch);

		expect(root.children[0].value).toBe('0');
		expect(root.children[1].value).toBe('false');
		expect(root.children[2].value).toBe('');
		expect(root.children[3].value).toBe('');
	});

	it('should clear falsey DOM properties', () => {
		let root;
		function test(val) {
			root = render((
				<div>
					<input value={val} />
					<table border={val} />
				</div>
			), scratch, root);
		}

		test('2');
		test(false);
		expect(nowrap(scratch.innerHTML))
			.toBe('<div __n="div"><input value=false __n="input"><table __n="table"></table></div>');

		test('3');
		test(null);
		expect(nowrap(scratch.innerHTML))
			.toBe('<div __n="div"><input __n="input"><table __n="table"></table></div>');

		test('4');
		test(undefined);
		expect(nowrap(scratch.innerHTML))
			.toBe('<div __n="div"><input __n="input"><table __n="table"></table></div>');
	});

	it('should apply string attributes', () => {
		render(<div foo="bar" data-foo="databar" />, scratch);

		let div = scratch.childNodes[0];
		expect(div.attributes.length).toBe(4);

		expect(div.attributes[2].name).toBe('foo');
		expect(div.attributes[2].value).toBe('bar');

		expect(div.attributes[3].name).toBe('data-foo');
		expect(div.attributes[3].value).toBe('databar');
	});

	it('should serialize object props as attributes', () => {
		render(<div foo={{ a: 'b' }} bar={{ toString() { return 'abc'; } }} />, scratch);

		let div = scratch.childNodes[0];
		expect(div.attributes.length).toBe(4);

		expect(div.attributes[2].name).toBe('foo');
		expect(div.attributes[2].value).toBe('[object Object]');

		expect(div.attributes[3].name).toBe('bar');
		expect(div.attributes[3].value).toBe('abc');
	});

	it('should apply class as String', () => {
		render(<div class="foo" />, scratch);
		expect(scratch.childNodes[0].className).toBe('foo');
	});

	it('should alias className to class', () => {
		render(<div className="bar" />, scratch);
		expect(scratch.childNodes[0].className).toBe('bar');
	});

	it('should apply style as String', () => {
		render(<div style="top:5px; position:relative;" />, scratch);
		expect(scratch.childNodes[0].style.cssText).toBe('POSITION: relative; TOP: 5px')
	});

	it('should only register on* functions as handlers', () => {
		const onclick = jasmine.createSpy('onclick');

		render(<div onClick={ onclick } />, scratch);
		fireEvent(scratch.childNodes[0], 'click')
		
		expect(onclick.calls.count()).toEqual(1)
	});

	it('should add and remove event handlers', () => {
		let click = jasmine.createSpy(),
			mousedown = jasmine.createSpy();

		render(<div onClick={ () => click(1) } onMouseDown={ mousedown } />, scratch);
		fireEvent(scratch.childNodes[0], 'click');
		expect(click).toHaveBeenCalledWith(1)

		render(<div onClick={ () => click(2) } />, scratch, scratch.firstChild);
		fireEvent(scratch.childNodes[0], 'click');
		expect(click.calls.count()).toEqual(2)
		expect(click).toHaveBeenCalledWith(2)

		fireEvent(scratch.childNodes[0], 'click');
		expect(click.calls.count()).toEqual(3)

		fireEvent(scratch.childNodes[0], 'mousedown');
		expect(mousedown.calls.count()).toEqual(0)

		render(<div />, scratch, scratch.firstChild);

		fireEvent(scratch.childNodes[0], 'click');
		expect(click.calls.count()).toEqual(3)
	});

	it('should serialize style objects', () => {
		let root = render((
			<div style={{
				color: 'rgb(255, 255, 255)',
				background: 'rgb(255, 100, 0)',
				backgroundPosition: '10px 10px',
				'background-size': 'cover',
				padding: 5,
				top: 100,
				left: '100%'
			}}>
				test
			</div>
		), scratch);

		let { style } = scratch.childNodes[0];
		expect(style.color).toBe('rgb(255,255,255)');
		expect(style.background).toMatch(/^rgb\(255,100,0\)/);
		expect(style.backgroundPosition).toBe('10px 10px');
		expect(style.backgroundSize).toBeUndefined()
		expect(style.padding).toBe('5px');
		expect(style.top).toBe('100px');
		expect(style.left).toBe('100%');

		root = render((
			<div style={{ color: 'rgb(0, 255, 255)' }}>test</div>
		), scratch, root);

		expect(root.style.cssText).toBe('BACKGROUND: none transparent scroll repeat 0% 0%; COLOR: rgb(0,255,255); background-size: ');

		root = render((
			<div style="display: inline;">test</div>
		), scratch, root);

		expect(root.style.cssText).toBe('DISPLAY: inline');

		root = render((
			<div style={{ backgroundColor: 'rgb(0, 255, 255)' }}>test</div>
		), scratch, root);

		expect(root.style.cssText).toBe('BACKGROUND-COLOR: rgb(0,255,255)');
	});

	it('should support dangerouslySetInnerHTML', () => {
		let html = '<b>foo &amp; bar</b>';
		let root = render(<div dangerouslySetInnerHTML={{ __html: html }} />, scratch);

		expect(nowrap(scratch.firstChild.innerHTML)).toBe(html);
		expect(nowrap(scratch.innerHTML)).toBe('<div __n="div">'+html+'</div>');

		root = render(<div>a<strong>b</strong></div>, scratch, root);

		expect(nowrap(scratch.innerHTML)).toBe(`<div __n="div">a<strong __n="strong">b</strong></div>`);

		render(<div dangerouslySetInnerHTML={{ __html: html }} />, scratch, root);

		expect(nowrap(scratch.innerHTML)).toBe('<div __n="div">'+html+'</div>');
	});

	it('should apply proper mutation for VNodes with dangerouslySetInnerHTML attr', () => {
		class Thing extends Component {
			constructor(props, context) {
				super(props, context);
				this.state.html = this.props.html;
			}
			render(props, { html }) {
				return html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : <div />;
			}
		}

		let thing;

		render(<Thing ref={ c => thing=c } html="<b><i>test</i></b>" />, scratch);

		expect(nowrap(scratch.innerHTML)).toBe('<div __n="div"><b><i>test</i></b></div>');

		thing.setState({ html: false });
		thing.forceUpdate();

		expect(nowrap(scratch.innerHTML)).toBe('<div __n="div"></div>');

		thing.setState({ html: '<foo><bar>test</bar></foo>' });
		thing.forceUpdate();

		expect(nowrap(scratch.innerHTML)).toBe('<div __n="div"><foo><bar>test</bar></foo></div>');
	});

	it('should hydrate with dangerouslySetInnerHTML', () => {
		let html = '<b>foo &amp; bar</b>';
		scratch.innerHTML = `<div>${html}</div>`;
		render(<div dangerouslySetInnerHTML={{ __html: html }} />, scratch, scratch.lastChild);

		expect(nowrap(scratch.firstChild.innerHTML)).toBe(html);
		expect(nowrap(scratch.innerHTML)).toBe(`<div>${html}</div>`);
	});

	it('should reconcile mutated DOM attributes', () => {
		let check = p => render(<input type="checkbox" checked={p} />, scratch, scratch.lastChild),
			value = () => scratch.lastChild.checked,
			setValue = p => scratch.lastChild.checked = p;
		check(true);
		expect(value()).toBe(true);
		check(false);
		expect(value()).toBe(false);
		check(true);
		expect(value()).toBe(true);
		setValue(true);
		check(false);
		expect(value()).toBe(false);
		setValue(false);
		check(true);
		expect(value()).toBe(true);
	});

	it('should ignore props.children if children are manually specified', () => {
		expect(
			<div a children={['a', 'b']}>c</div>
		).toEqual(
			<div a>c</div>
		);
	});

	it('should reorder child pairs', () => {
		let root = render((
			<div>
				<a>a</a>
				<b>b</b>
			</div>
		), scratch, root);

		let a = scratch.firstChild.firstChild;
		let b = scratch.firstChild.lastChild;

		expect(a.nodeName).toBe('A');
		expect(b.nodeName).toBe('B');

		root = render((
			<div>
				<b>b</b>
				<a>a</a>
			</div>
		), scratch, root);

		expect(scratch.firstChild.firstChild.nodeName).toBe('B');
		expect(scratch.firstChild.lastChild.nodeName).toBe('A');
		expect(scratch.firstChild.firstChild).toEqual(b);
		expect(scratch.firstChild.lastChild).toEqual(a);
	});

	it('should not merge attributes with node created by the DOM', () => {
		const html = (htmlString) => {
			const div = document.createElement('div');
			div.innerHTML = htmlString;
			return div.firstChild;
		};

		const DOMElement = html`<div><a foo="bar"></a></div>`;
		const preactElement = <div><a></a></div>;

		render(preactElement, scratch, DOMElement);
		expect(nowrap(scratch.innerHTML)).toBe('<div><a></a></div>');
	});

	it('should skip non-preact elements', () => {
		class Foo extends Component {
			render() {
				let alt = this.props.alt || this.state.alt || this.alt;
				let c = [
					<a>foo</a>,
					<b>{ alt?'alt':'bar' }</b>
				];
				if (alt) c.reverse();
				return <div>{c}</div>;
			}
		}

		let comp;
		let root = render(<Foo ref={ c => comp = c } />, scratch, root);

		let c = document.createElement('c');
		c.innerText = 'baz';
		comp.base.appendChild(c);

		let b = document.createElement('b');
		b.innerText = 'bat';
		comp.base.appendChild(b);

		expect(scratch.firstChild.children.length).toBe(4);

		comp.forceUpdate();

		expect(scratch.firstChild.children.length).toBe(4);
		//<div><a>foo</a><b>bar</b><c>baz</c><b>bat</b></div>
		expect(nowrap(scratch.innerHTML)).toEqual(`<div __n="div"><a __n="a">foo</a><b __n="b">bar</b><c>baz</c><b>bat</b></div>`);

		comp.alt = true;
		comp.forceUpdate();

		expect(scratch.firstChild.children.length).toBe(4);
		// <div><b>alt</b><a>foo</a><c>baz</c><b>bat</b></div>
		expect(nowrap(scratch.innerHTML)).toEqual(`<div __n="div"><b __n="b">alt</b><a __n="a">foo</a><c>baz</c><b>bat</b></div>`);

		// Re-rendering from the root is non-destructive if the root was a previous render:
		comp.alt = false;
		root = render(<Foo ref={ c => comp = c } />, scratch, root);

		expect(scratch.firstChild.children.length).toBe(4);
		// <div><a>foo</a><b>bar</b><c>baz</c><b>bat</b></div>
		expect(nowrap(scratch.innerHTML)).toEqual(`<div __n="div"><a __n="a">foo</a><b __n="b">bar</b><c>baz</c><b>bat</b></div>`);

		comp.alt = true;
		root = render(<Foo ref={ c => comp = c } />, scratch, root);

		expect(scratch.firstChild.children.length, 'root re-render 2').toBe(4);
		// <div><b>alt</b><a>foo</a><c>baz</c><b>bat</b></div>
		expect(nowrap(scratch.innerHTML)).toEqual(`<div __n="div"><b __n="b">alt</b><a __n="a">foo</a><c>baz</c><b>bat</b></div>`);

		root = render(<div><Foo ref={ c => comp = c } /></div>, scratch, root);

		// <div><div><a>foo</a><b>bar</b></div><c>baz</c><b>bat</b></div>
		expect(scratch.firstChild.children.length, 'root re-render changed').toBe(3);
		expect(nowrap(scratch.innerHTML)).toEqual(`<div __n="div"><div __n="div"><a __n="a">foo</a><b __n="b">bar</b></div><c>baz</c><b>bat</b></div>`);
	});

	it('should not execute append operation when child is at last', (done) => {
		let input;
		class TodoList extends Component {
			constructor(props) {
				super(props);
				this.state = { todos: [], text: '' };
				this.setText = this.setText.bind(this);
				this.addTodo = this.addTodo.bind(this);
			}
			setText(e) {
				this.setState({ text: e.target.value });
			}
			addTodo() {
				let { todos, text } = this.state;
				todos = todos.concat({ text });
				this.setState({ todos, text: '' });
			}
			render() {
				const {todos, text} = this.state;
				return (
						<div onKeyDown={ this.addTodo }>
								{ todos.map( todo => (<div>{todo.text}</div> )) }
								<input value={text} onInput={this.setText} ref={(i) => input = i} />
						</div>
				);
			}
		}
		const root = render(<TodoList />, scratch);
		input.focus();
		input.value = 1;
		root._component.setText({
			target: input
		});
		root._component.addTodo();
		expect(document.activeElement).toEqual(input);
		setTimeout(() =>{
			expect(/1/.test(scratch.innerHTML)).toEqual(true);
			done();
		}, 10);
	});
})