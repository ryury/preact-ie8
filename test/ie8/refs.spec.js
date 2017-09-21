const React = require('preact')
const { h, render, rerender, Component } = React

let spy = (name) => {
	let spy = sinon.spy(name);
	return spy;
};

describe('refs', () => {
	let scratch;

	before( () => {
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

	it('should invoke refs in render()', () => {
		let ref = spy('ref');
		render(<div ref={ref} />, scratch);
		expect(ref).toHaveBeenCalledWith(scratch.firstChild);
	});

	it('should invoke refs in Component.render()', () => {
		let outer = spy('outer'),
			inner = spy('inner');
		class Foo extends Component {
			render() {
				return (
					<div ref={outer}>
						<span ref={inner} />
					</div>
				);
			}
		}
		render(<Foo />, scratch);

		expect(outer).calledWith(scratch.firstChild)
		expect(inner).calledWith(scratch.firstChild.firstChild);
	});

	it('should pass components to ref functions', () => {
		let ref = spy('ref'),
			instance;
		class Foo extends Component {
			constructor() {
				super();
				instance = this;
			}
			render() {
				return <div />;
			}
		}
		render(<Foo ref={ref} />, scratch);

		expect(ref).calledOnce()
		expect(ref).calledWith(instance)
	});

	it('should pass rendered DOM from functional components to ref functions', () => {
		let ref = spy('ref');

		const Foo = () => <div />;

		let root = render(<Foo ref={ref} />, scratch);
		expect(ref).calledOnce();

		ref.calls.reset();
		render(<Foo ref={ref} />, scratch, root);
		expect(ref).calledOnce();

		ref.calls.reset();
		render(<span />, scratch, root);
		expect(ref).calledWith(null);
		expect(ref).calledOnce();
	});

	it('should pass children to ref functions', () => {
		let outer = spy('outer'),
			inner = spy('inner'),
			InnermostComponent = 'span',
			rerender, inst;
		class Outer extends Component {
			constructor() {
				super();
				rerender = this;
			}
			render() {
				return (
					<div>
						<Inner ref={outer} />
					</div>
				);
			}
		}
		class Inner extends Component {
			constructor() {
				super();
				inst = this;
			}
			render() {
				return <InnermostComponent ref={inner} />;
			}
		}

		let root = render(<Outer />, scratch);

		expect(outer).calledOnce();
		expect(outer).calledWith(inst);
		
		expect(inner).calledOnce(inst.base);
		expect(inner).calledWith(inst.base);

		outer.calls.reset()
		inner.calls.reset()

		rerender.forceUpdate();

		expect(outer, 're-render').calledOnce(inst);
		expect(outer, 're-render').calledWith(inst);
		expect(inner, 're-render').not.calledOnce()

		inner.calls.reset()
		InnermostComponent = 'x-span';
		rerender.forceUpdate();
		// expect(inner, 're-render swap');
		// expect(inner.firstCall, 're-render swap').calledWith(null);
		// expect(inner.secondCall, 're-render swap').to.have.been.calledWith(inst.base);
		// InnermostComponent = 'span';

		outer.calls.reset()
		inner.calls.reset()

		render(<div />, scratch, root);

		expect(outer, 'unrender').calledWith(null);
		expect(inner, 'unrender').calledWith(null);
	});

	it('should pass high-order children to ref functions', () => {
		let outer = spy('outer'),
			inner = spy('inner'),
			innermost = spy('innermost'),
			InnermostComponent = 'span',
			outerInst,
			innerInst;
		class Outer extends Component {
			constructor() {
				super();
				outerInst = this;
			}
			render() {
				return <Inner ref={inner} />;
			}
		}
		class Inner extends Component {
			constructor() {
				super();
				innerInst = this;
			}
			render() {
				return <InnermostComponent ref={innermost} />;
			}
		}

		let root = render(<Outer ref={outer} />, scratch);

		expect(outer, 'outer initial').calledWith(outerInst);
		expect(inner, 'inner initial').calledWith(innerInst);
		expect(innermost, 'innerMost initial').calledWith(innerInst.base);

		outer.calls.reset()
		inner.calls.reset()
		innermost.calls.reset()
		root = render(<Outer ref={outer} />, scratch, root);

		expect(outer, 'outer update').calledWith(outerInst);
		expect(inner, 'inner update').calledWith(innerInst);
		expect(innermost, 'innerMost update').not.toHaveBeenCalled();

		innermost.calls.reset()
		InnermostComponent = 'x-span';
		root = render(<Outer ref={outer} />, scratch, root);
		// expect(innermost, 'innerMost swap');
		// expect(innermost.firstCall, 'innerMost swap').calledWith(null);
		// expect(innermost.secondCall, 'innerMost swap').calledWith(innerInst.base);
		InnermostComponent = 'span';

		outer.calls.reset()
		inner.calls.reset()
		innermost.calls.reset()
		render(<div />, scratch, root);

		expect(outer, 'outer unmount').calledWith(null);
		expect(inner, 'inner unmount').calledWith(null);
		expect(innermost, 'innerMost unmount').calledWith(null);
	});

	// it('should not pass ref into component as a prop', () => {
	// 	let foo = spy('foo'),
	// 		bar = spy('bar');

	// 	class Foo extends Component {
	// 		render(){ return <div />; }
	// 	}
	// 	const Bar = spy('Bar', () => <div />);

	// 	spyOn(Foo.prototype, 'render');

	// 	render((
	// 		<div>
	// 			<Foo ref={foo} a="a" />
	// 			<Bar ref={bar} b="b" />
	// 		</div>
	// 	), scratch);

	// 	expect(Foo.prototype.render).calledWithMatch({ ref:sinon.match.falsy, a:'a' }, { }, { });
	// 	expect(Bar).to.have.been.calledWithMatch({ b:'b', ref:sinon.match.falsy }, { });
	// });

	// Test for #232
	// it('should only null refs after unmount', () => {
	// 	let root, outer, inner;

	// 	class TestUnmount extends Component {
	// 		componentWillUnmount() {
	// 			expect(this).to.have.property('outer', outer);
	// 			// expect(this).to.have.property('inner', inner);

	// 			setTimeout( () => {
	// 				// expect(this).to.have.property('outer', null);
	// 				// expect(this).to.have.property('inner', null);
	// 			});
	// 		}

	// 		render() {
	// 			return (
	// 				<div id="outer" ref={ c => this.outer=c }>
	// 					<div id="inner" ref={ c => this.inner=c } />
	// 				</div>
	// 			);
	// 		}
	// 	}

	// 	sinon.spy(TestUnmount.prototype, 'componentWillUnmount');

	// 	root = render(<div><TestUnmount /></div>, scratch, root);
	// 	outer = scratch.querySelector('#outer');
	// 	inner = scratch.querySelector('#inner');

	// 	// expect(TestUnmount.prototype.componentWillUnmount).not.toHaveBeenCalled();

	// 	render(<div />, scratch, root);

	// 	// expect(TestUnmount.prototype.componentWillUnmount).to.have.been.calledOnce;
	// });

	// it('should null and re-invoke refs when swapping component root element type', () => {
	// 	let inst;

	// 	class App extends Component {
	// 		render() {
	// 			return <div><Child /></div>;
	// 		}
	// 	}

	// 	class Child extends Component {
	// 		constructor(props, context) {
	// 			super(props, context);
	// 			this.state = { show:false };
	// 			inst = this;
	// 		}
	// 		handleMount(){}
	// 		render(_, { show }) {
	// 			if (!show) return <div id="div" ref={this.handleMount}></div>;
	// 			return <span id="span" ref={this.handleMount}>some test content</span>;
	// 		}
	// 	}
	// 	sinon.spy(Child.prototype, 'handleMount');

	// 	render(<App />, scratch);
	// 	expect(inst.handleMount).calledWith(scratch.querySelector('#div'));
	// 	inst.handleMount.calls.reset()

	// 	inst.setState({ show:true });
	// 	inst.forceUpdate();
	// 	expect(inst.handleMount).to.have.been.calledTwice;
	// 	expect(inst.handleMount.firstCall).to.have.been.calledWith(null);
	// 	expect(inst.handleMount.secondCall).to.have.been.calledWith(scratch.querySelector('#span'));
	// 	inst.handleMount.calls.reset()

	// 	inst.setState({ show:false });
	// 	inst.forceUpdate();
	// 	expect(inst.handleMount).to.have.been.calledTwice;
	// 	expect(inst.handleMount.firstCall).to.have.been.calledWith(null);
	// 	expect(inst.handleMount.secondCall).to.have.been.calledWith(scratch.querySelector('#div'));
	// });


	// it('should add refs to components representing DOM nodes with no attributes if they have been pre-rendered', () => {
	// 	// Simulate pre-render
	// 	let parent = document.createElement('div');
	// 	let child = document.createElement('div');
	// 	parent.appendChild(child);
	// 	scratch.appendChild(parent); // scratch contains: <div><div></div></div>

	// 	let ref = spy('ref');

	// 	class Wrapper {
	// 		render() {
	// 			return <div></div>;
	// 		}
	// 	}

	// 	render(<div><Wrapper ref={ c => ref(c.base) } /></div>, scratch, scratch.firstChild);
	// 	expect(ref).calledWith(scratch.firstChild.firstChild);
	// });
});