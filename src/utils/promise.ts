export function runManyPromises(
    promiseCalls: (() => Promise<any>)[],
    max = 1,
    options: {
        /**
         * 一个 Promise 最大等待执行完成时间
         */
        maxWait: number;
    } = {
            maxWait: 3000,
        },
) {
    let idx = max;
    let finishNums = 0;
    return new Promise<void>((res) => {
        // eslint-disable-next-line consistent-return
        function next() {
            ++finishNums;
            if (finishNums >= promiseCalls.length) {
                return res();
            }
            if (idx >= promiseCalls.length) {
                // eslint-disable-next-line consistent-return
                return;
            }
            const targetIdx = idx++;
            let t = 0;
            const timeoutPromise = new Promise<void>((res) => {
                t = window.setTimeout(() => res(), options.maxWait);
            });
            Promise.race([
                timeoutPromise,
                promiseCalls[targetIdx]().then(() => {
                    window.clearTimeout(t);
                }),
            ]).then(next);
        }
        promiseCalls.slice(0, max).forEach((call) => {
            let t = 0;
            const timeoutPromise = new Promise((res) => {
                t = window.setTimeout(res, options.maxWait);
            });
            Promise.race([timeoutPromise, call().then(() => window.clearTimeout(t))]).then(next);
        });
    });
}
