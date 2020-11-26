export function runManyPromises(promiseCalls: (() => Promise<any>)[], max = 1, options: {
    /**
     * 一个 Promise 最大等待执行完成时间
     */
    maxWait: number;
} = {
    maxWait: 3000,
}) {
    let idx = max;
    let finishNums = 0;
    return new Promise<void>(res => {
        function next() {
            ++finishNums;
            if (finishNums === promiseCalls.length) {
                return res();
            };
            if (idx === promiseCalls.length) {
                return;
            }
            const targetIdx = idx++;
            Promise.race([
                promiseCalls[targetIdx](),
                new Promise(res => setTimeout(res, options.maxWait)),
            ]).then(next);
        }
        promiseCalls.slice(0, max).forEach(call => {
            Promise.race([
                call(),
                new Promise(res => setTimeout(res, options.maxWait)),
            ]).then(next);
        });
    });
}
