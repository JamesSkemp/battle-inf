app.service('messageService', function($timeout)
{
    this.gameControllerScope = null;

    var messages = [];
    var timers = [];

    this.setGameControllerScope = function(scope)
    {
        this.gameControllerScope = scope;
        this.gameControllerScope.messages = messages;
    };

    this.appendMessage = function(messageString)
    {
        messages.push(mergeObjects({}, {message:messageString}));
        timers.push($timeout(this.messageTimeout, 5000));
    };

    this.messageTimeout = function()
    {
        messages.shift();
    };

    this.clearAll = function() {
        while(messages.length > 0)
        {
            messages.pop();

            // Make sure to cancel all timers as well
            $timeout.cancel(timers.pop());
        }
    };
});

var getMessageService = function() {
    var elem = angular.element($('body')[0]); // Get the controller
    var injector = elem.injector(); // Get the controller's injector
    return injector.get('messageService'); // Get the service.
};
