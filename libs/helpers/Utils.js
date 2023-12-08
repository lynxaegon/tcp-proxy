module.exports = new (class Utils {
    uuidv4() {
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    throttle(func, limit) {
        let timeout;
        let lastArgs;
        let lastCall = 0;

        return function() {
            const context = this;
            const args = arguments;
            const now = Date.now();

            clearTimeout(timeout);

            if (now - lastCall < limit) {
                lastArgs = args;

                timeout = setTimeout(function() {
                    func.apply(context, lastArgs);
                    lastCall = Date.now();
                }, limit);
            } else {
                lastCall = now;
                func.apply(context, args);
            }
        };
    }

})();