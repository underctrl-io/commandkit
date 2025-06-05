const { getCommandKit } = require('./dist/context/async-context.js');
const { AnalyticsEngine } = require('./dist/analytics/analytics-engine.js');
const { noAnalytics } = require('./dist/analytics/utils.js');
const { AnalyticsEvents } = require('./dist/analytics/constants.js');

function useAnalytics() {
    const commandkit = getCommandKit(true);
    return commandkit.analytics;
}

function track(event) {
    return useAnalytics().track(event);
}

module.exports = {
    AnalyticsEvents,
    AnalyticsEngine,
    useAnalytics,
    noAnalytics,
    track,
};