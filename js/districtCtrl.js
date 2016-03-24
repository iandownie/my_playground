// Doesn't do anything yet, example for incorporating in the future

/**
 * Add a Book factory object which parses dates
 */
app.factory('DecisionFactory', function ($firebaseObject) {
    return $firebaseObject.$extend({
        /**
         * Called each time there is an update from the server
         * to update our Book data
         */
        $$updated: function (snap) {
            // call the super
            var changed = $firebaseObject.prototype
                .$$updated.apply(this, arguments);
            // manipulate the date
            if( changed ) {
               this.date = new Date(this.date||0);
            }
            // inform the sync manager that it changed
            return changed;
        },
        
        /**
         * Used when our book is saved back to the server
         * to convert our dates back to JSON
         */
        toJSON: function() {
            return angular.extend({}, this, {
                // revert Date objects to json data
                date: this.date? this.date.getTime() : null
            });
        }
    });
});