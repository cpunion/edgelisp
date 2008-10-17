// Lisp runtime: variables and functions needed by the compiled JavaScript code.

// Returns true iff class B is a subclass of (or equal to) class A.
function lispIsSubclass(classA, classB) {
    return classA == classB;
}

function lispGetClass(obj) {
    return obj.__proto__;
}

// Exception handler frame:
// 
// { handlers: <<handlers>>, parentFrame: <<handler_frame>> }
//
// handlers is a list of { class: <<exception_class>>, function: <<handler_function>> }

var lispHandlerFrame = null; // bottom-most frame or null

function lispCallWithHandlers(fun, handlers) {
    try {
        var origHandlerFrame = lispHandlerFrame;
        lispHandlerFrame = { handlers: handlers, parentFrame: origHandlerFrame };
        return fun();
    } finally {
        lispHandlerFrame = origHandlerFrame;
    }
}

function lispFindHandler(exception, handlerFrame) {
    print(uneval(handlerFrame));
    if (!handlerFrame) return null;
    var handlers = handlerFrame.handlers;
    var exceptionClass = lispGetClass(exception);
    for (var i in handlers) {
        var handler = handlers[i];
        if (lispIsSubclass(handler["class"], exceptionClass))
            return handler;
    }
    print(uneval(handlerFrame.parentFrame));
    return lispFindHandler(exception, handlerFrame.parentFrame);
}

function lispThrow(exception) {
    var handler = lispFindHandler(exception, lispHandlerFrame);
    if (handler) return handler["function"](exception, function() { throw "NIY"; });
    else throw "No applicable handler for exception " + uneval(lispGetClass(exception).name);
}
