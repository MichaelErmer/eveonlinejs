/**
 * Generic rate-limiter.
 *
 * The following list of options are recognized:
 * <ul>
 *   <li><strong>perSecond</strong>: Maximum number of jobs to execute in a second.</li>
 * </ul>
 *
 * @exports RateLimiter
 * @param {Object} options Parameters
 * @constructor
 */
function RateLimiter(options) {
  this.perSecond = options.perSecond
  this._lastExecuted = null
  this._pendingJobs = []
  this._timerID = null
}

module.exports = RateLimiter

/**
 * Enqueue a job to be run. Queued jobs are executed FIFO, no faster than the
 * set rate limit.
 * The job function is expected to <em>immediately</em> perform the
 * rate-limited action (e.g. making an HTTP request). If the job function waits
 * before performing the rate-limited action, it may cause requests to
 * temporarily spike above the rate limit. (As long as each job function
 * performs no more than one action, though, the rate will on average stay
 * below the limit.)
 *
 * @param {Function} job Function to be rate-limited.
 */
RateLimiter.prototype.enqueue = function(job) {
  var now = +new Date
  if (this._timerID || now - this._lastExecuted < 1000/this.perSecond) {
    this._pendingJobs.push(job)
    if (!this._timerID) {
      var nextExecutionMs = this._lastExecuted + 1000/this.perSecond - now
      this._timerID = setTimeout(this._processPendingJobs.bind(this), nextExecutionMs)
    }
  } else {
    this._lastExecuted = now
    // Call the job in the following tick to prevent potential issues with
    // exception handling (if we were to call job() directly, it might throw an
    // exception, causing different application behaviour than if it were
    // executed in a setTimeout() callback).
    setTimeout(job)
  }
}

RateLimiter.prototype._processPendingJobs = function() {
  var now = +new Date
  var job = this._pendingJobs.shift()
  // If there are still more jobs, schedule another tick.
  if (this._pendingJobs.length)
    this._timerID = setTimeout(this._processPendingJobs.bind(this), 1000/this.perSecond)
  else
    this._timerID = null
  this._lastExecuted = now
  job()
}
