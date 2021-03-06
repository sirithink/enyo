(function (enyo) {

	//*@public
	/**
		_enyo.ViewController_ is an abstract kind designed for use in a
		tightly-coupled controller and views, in which the controller owns
		the view and maintains its state and lifecycle.
	*/
	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.ViewController",

		//*@public
		kind: "enyo.Controller",

		//*@public
		/**
			This may be a string representing a kind, a constructor for a kind,
			or an object literal defining the view structure to be instanced.
			Once the view controller has been initialized, this property will
			be a reference to the instance of the view owned by this controller.
		*/
		view: null,

		//*@public
		/**
			A string that represents the target DOM element in which to render
			the controller's view. By default, this is set to the special
			identifier: `"document.body"`. It may also be set to a unique DOM
			element __id__ attribute.
		*/
		renderTarget: "document.body",

		// ...........................
		// PROTECTED PROPERTIES

		//*@protected
		_isViewController: true,

		//*@protected
		_savedView: null,

		// ...........................
		// COMPUTED PROPERTIES

		computed: {
			_viewKind: [{cached: true}],
			_renderTarget: ["renderTarget", {cached: true}]
		},

		//*@protected
		/**
			On object initialization, finds or creates the appropriate
			kind for the view of this controller.
		*/
		_viewKind: function () {
			// the original definition as supplied by the controller's
			// own definition
			var view = this.view;
			// if it is a function, we assume it is a constructor
			if ("function" === typeof view) {
				return view;
			}
			// if it is an object literal, we assume it is a definition
			// and note that we create an anonymous kind for the view
			// so it has all of the normal setup of a full kind
			if ("object" === typeof view) {
				if (!view.name) {
					view.name = this._makeViewName();
				}
				return enyo.kind(view);
			}
			// if it is a string, we attempt to find the constructor
			// it should be pointing to
			if ("string" === typeof view) {
				view = enyo.getPath(view);
				if (!view.prototype.kindName) {
					view.prototype.kindName = this._makeViewName();
				}
				return view;
			}
			// if we get here, we had nothing, and in that case we
			// can't do anything
			throw this.kindName + " cannot initialize without a valid view defined";
		},

		//*@protected
		/**
			Finds the appropriate form of the render target.
		*/
		_renderTarget: function () {
			// the original supplied variable for the render target
			var target = this.renderTarget;
			// we attempt to find the actual target node
			target = enyo.dom.byId(target) || enyo.getPath(target);
			if (target) {
				return target;
			}
			// if we can't find the target, we can't render it into anything;
			// better to find out now
			throw this.kindName + " cannot find the render target: " + this.renderTarget;
		},

		// ...........................
		// PUBLIC METHODS

		//*@public
		/**
			Renders the controller's view into the DOM. If the view is already
			in the DOM, the element is re-rendered in place.
		*/
		render: function () {
			// instance of the view
			var view = this.view;
			var target = this.get("_renderTarget");
			// if the view already has a DOM node, we don't need to
			// attempt to re-insert it
			if (view.hasNode()) {
				view.render();
			} else {
				// otherwise, we need to render it into the DOM
				view.renderInto(target);
			}
		},

		//*@public
		/**
			Immediately renders the controller's view into the passed-in target
			(either a node reference or s string representing a node id attribute
			in the DOM).
		*/
		renderInto: function (target) {
			// update the render target for the controller
			this.set("renderTarget", target);
			// now we render as usual
			this.render();
		},

		//*@public
		/**
			Destroy the current view and recreate it from either the
			original description or a newly provided one. If a view
			is provided, it will become the new base description for
			future _resetView()_ calls.
		*/
		resetView: function(newView) {
			this.view.destroy();
			this.view = newView || this._savedView;
			this._createView();
		},

		//*@public
		destroy: function() {
			this.view.destroy();
			this.view = null;
			this.inherited(arguments);
		},

		// ...........................
		// PROTECTED METHODS

		//*@protected
		constructed: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				// ensure we have created the view instance, note that
				// this is done here _prior_ to mixin initialization
				// (which takes place after all construction is done)
				// but this allows subkinds to overload the constructed
				// method to control the flow
				this._createView();
			};
		}),

		//*@protected
		/**
			Creates the actual instance of the controller's view. Should
			be overloaded for special behaviors.
		*/
		_createView: function () {
			// keep a reference to the original view descriptor
			// so it can be reused in the future if we destroy
			// the view object
			this._savedView = this.view;
			// retrieve the constructor for the view and immediately
			// instance it while also updating the _view_ property to
			// the reference for this new view
			var Ctor = this.get("_viewKind");
			this.set("view", new Ctor({_bubbleTarget: this}));
		},

		//*@protected
		_makeViewName: function () {
			return enyo.uid("_viewControllerView_");
		}
	});

}(enyo));
