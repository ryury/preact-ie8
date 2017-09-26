const React = require('preactCompat')
const {
	render,
	createClass,
	createElement,
	cloneElement,
	Component,
	PropTypes,
	unstable_renderSubtreeIntoContainer,
	__spread
} = React;

describe('preact-compat', () => {
	describe('render()', () => {
		it('should be exported', () => {
      // expect(React.render).toBe()
      expect(typeof React.render).toBe('function')
		});

		it('should replace isomorphic content', () => {
			let ce = (type) => document.createElement(type);
			let Text = (text) => document.createTextNode(text);
			let root = ce('div');
			let initialChild = ce('div');
			initialChild.appendChild(Text('initial content'));
			root.appendChild(initialChild);

      render(<div>dynamic content</div>, root);
      expect(root.innerText).toBe('dynamic content')
		});

		it('should remove extra elements', () => {
			let ce = (type) => document.createElement(type);
			let Text = (text) => document.createTextNode(text);
			let root = ce('div');

			let c1 = ce('div');
			c1.appendChild(Text('isomorphic content'));
			root.appendChild(c1);

			let c2 = ce('div');
			c2.appendChild(Text('extra content'));
			root.appendChild(c2);

			render(<div>dynamic content</div>, root);
			expect(root.innerText).toBe('dynamic content')
		});

		it('should remove text nodes', () => {
			let ce = (type) => document.createElement(type);
			let Text = (text) => document.createTextNode(text);
			let root = ce('div');

			root.appendChild(Text('Text Content in the root'));
			root.appendChild(Text('More Text Content'));

			render(<div>dynamic content</div>, root);
			expect(root.innerText).toBe('dynamic content')
		});

		it('should support defaultValue', () => {
			let scratch = document.createElement('div');
			(document.body || document.documentElement).appendChild(scratch);
			render(<input defaultValue="foo"></input>, scratch);
			expect(scratch.firstChild.value).toBe('foo');
		});

	});


	describe('createClass()', () => {
		it('should be exported', () => {
			expect(typeof createClass).toBe('function');
		});

		it('should create a Component', () => {
			let specState = { something: 1 };
			let spec = {
				foo: 'bar',
				getInitialState() {
					return specState;
				},
				method: sinon.spy()
			};
			const C = createClass(spec);
      let inst = new C();
      expect(inst.foo).toBe('bar')
      expect(inst.state).toBe(specState)
      expect(typeof inst.method).toBe('function');
      expect(inst instanceof Component).toBe(true);

      inst.method('a','b')
      expect(spec.method).toHaveBeenCalled()
		});

		it('should not bind blacklisted methods', () => {
			let constructor = () => {};
			let render = () => null;
			const C = createClass({
				constructor,
				render
			});
			let c = new C();
			expect(c.constructor).toBe(constructor);
			expect(c.render.__bound).toBe(undefined);
		});

		it('should copy statics', () => {
			let def = {
				statics: {
					foo: 'bar',
					baz() {}
				}
			};
			let c = createClass(def);
			expect(c.foo).toBe(def.statics.foo);
			expect(c.baz).toBe(def.statics.baz);
		});

		it('should support mixins', () => {
			let def = {
				mixins: [
					{
						foo: sinon.spy(),
						bar: sinon.spy()
					},
					{
						bar: sinon.spy(),
						componentWillMount: sinon.spy(),
						render: 'nothing here'
					},
					{
						componentWillMount: sinon.spy()
					}
				],
				foo: sinon.spy(),
				componentWillMount: sinon.spy(),
				render () {
          return null
        }
			};
			let C = createClass(def);
			let inst = new C();

			inst.foo();
			expect(def.foo).calledOnce();
			expect(def.mixins[0].foo).calledOnce();

			inst.bar();
			expect(def.mixins[0].bar).calledOnce();
			expect(def.mixins[1].bar).calledOnce();

			let props = {},
				state = {};
			inst.componentWillMount(props, state);
			expect(def.mixins[1].componentWillMount).calledOnce()
			// 	.and.calledWithExactly(props, state);
			expect(def.mixins[2].componentWillMount).calledOnce()
			// 	.and.calledWithExactly(props, state)
			// 	.and.calledAfter(def.mixins[1].componentWillMount);

			expect(inst.render(props, state)).toEqual(null);
		});
	});

	describe('createElement()', () => {
		it('should be exported', () => {
			expect(typeof React.createElement).toBe('function')
				// .that.equals(createElement);
		});

		it('should normalize vnodes', () => {
			let vnode = <div a="b"><a>t</a></div>;
			// using typeof Symbol here injects a polyfill, which ruins the test. we'll hardcode the non-symbol value for now.
			let $$typeof = 0xeac7;
			expect(vnode.$$typeof).toBe($$typeof);
			expect(vnode.type).toBe('div');
      expect(typeof vnode.props).toBe('object');
			expect(vnode.props).not.toBeUndefined()
			expect(vnode.props.children[0].$$typeof).toBe($$typeof);
			expect(vnode.props.children[0].type).toBe('a');
			expect(typeof vnode.props.children[0].props).toBe('object');
			expect(vnode.props.children[0].props).toEqual({ children:['t'] });
		});

		it('should normalize onChange', () => {
			let props = { onChange(){} };

			function expectToBeNormalized(vnode, desc) {
				expect(typeof vnode.props.onChange).toBe('function')
				expect(Object.keys(vnode.props)).toEqual(['onChange'].concat(vnode.props.type ? 'type' : []))
			}

			function expectToBeUnmodified(vnode) {
				expect(vnode.props).toEqual({ ...props, ...(vnode.props.type ? { type:vnode.props.type } : {}) });
			}

			expectToBeUnmodified(<div {...props} />, '<div>');
			expectToBeUnmodified(<input {...props} type="radio" />, '<input type="radio">');
			expectToBeUnmodified(<input {...props} type="checkbox" />, '<input type="checkbox">');
			expectToBeUnmodified(<input {...props} type="file" />, '<input type="file">');

			expectToBeNormalized(<textarea {...props} />, '<textarea>');
			expectToBeNormalized(<input {...props} />, '<input>');
			expectToBeNormalized(<input {...props} type="text" />, '<input type="text">');

		});
	});

	describe('Component', () => {
		it('should be exported', () => {
			expect(React.Component).toBe(Component)
			expect(typeof React.Component).toBe('function')
		});
	});

	// describe('PropTypes', () => {
	// 	it('should be exported', () => {
	// 		expect(React)
	// 			.to.have.property('PropTypes')
	// 			.that.is.an('object')
	// 			.that.equals(PropTypes);
	// 	});
	// });

	describe('cloneElement', () => {
		// it('should clone elements', () => {
		// 	let element = <foo a="b" c="d">a<span>b</span></foo>;
		// 	expect(cloneElement(element)).toEqual(element);
		// });

		// it('should support props.children', () => {
		// 	let element = <foo children={<span>b</span>}></foo>;
		// 	expect(cloneElement(element)).to.eql(element);
		// });

		// it('children take precedence over props.children', () => {
		// 	let element = <foo children={<span>c</span>}><div>b</div></foo>;
		// 	let clone = cloneElement(element);
		// 	expect(clone).to.eql(element);
		// 	expect(clone.children[0].nodeName).to.eql('div');
		// });

		// it('should support children in prop argument', () => {
		// 	let element = <foo></foo>;
		// 	let children = [<span>b</span>];
		// 	let clone = cloneElement(element, { children });
		// 	expect(clone.children).to.eql(children);
		// });

		// it('children argument takes precedence over props.children', () => {
		// 	let element = <foo></foo>;
		// 	let childrenA = [<span>b</span>];
		// 	let childrenB = [<div>c</div>];
		// 	let clone = cloneElement(element, { children: childrenA }, ...childrenB);
		// 	expect(clone.children).to.eql(childrenB);
		// });

		// it('children argument takes precedence over props.children even if falsey', () => {
		// 	let element = <foo></foo>;
		// 	let childrenA = [<span>b</span>];
		// 	let clone = cloneElement(element, { children: childrenA }, undefined);
		// 	expect(clone.children).to.eql(undefined);
		// });
	});

	describe('unstable_renderSubtreeIntoContainer', () => {
		// class Inner extends Component {
		// 	render() {
		// 		return null;
		// 	}
		// 	getNode() {
		// 		return 'inner';
		// 	}
		// }

		// it('should export instance', () => {
		// 	class App extends Component {
		// 		render() {
		// 			return null;
		// 		}
		// 		componentDidMount() {
		// 			this.renderInner();
		// 		}
		// 		renderInner() {
		// 			const wrapper = document.createElement('div');
		// 			this.inner = unstable_renderSubtreeIntoContainer(this, <Inner/>, wrapper);
		// 		}
		// 	}
		// 	const root = document.createElement('div');
		// 	const app = render(<App/>, root);
		// 	console.log(app.inner)
		// 	// expect(typeof app.inner.getNode === 'function').toEqual(true);
		// });

		// it('should there must be a context in callback', () => {
		// 	class App extends Component {
		// 		render() {
		// 			return null;
		// 		}
		// 		componentDidMount() {
		// 			this.renderInner();
		// 		}
		// 		renderInner() {
		// 			const wrapper = document.createElement('div');
		// 			const self = this;
		// 			unstable_renderSubtreeIntoContainer(this, <Inner/>, wrapper, function() {
		// 				self.inner = this;
		// 			});
		// 		}
		// 	}
		// 	const root = document.createElement('div');
		// 	const app = render(<App/>, root);
		// 	expect(typeof app.inner.getNode === 'function').to.equal(true);
		// });
	});

	describe('Unsupported hidden internal __spread API', () => {
		it('should work with multiple objects', () => {
			const start = {};
			const result = React.__spread(start, {one: 1, two: 3}, {two: 2});
			expect(result).toEqual(start);
			expect(start).toEqual({ one: 1, two: 2});
		});

		it('should be exported on default and as __spread', () => {
			expect(__spread).toEqual(React.__spread);
		});
	});
});