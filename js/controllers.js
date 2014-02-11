angular.module('SeriesGuide.controllers', [])


/**
 * Main controller: Kicks in favorites display
 */
.controller('MainCtrl', 
  function($scope, FavoritesService) {
  	var favorites = [];

  	/**
  	 * The favorites service fetches data asynchronously via SQLite, we wait for it to emit the favorites:updated event.
  	 */
  	$scope.favorites = FavoritesService.favorites;
  	$scope.$on('favorites:updated', function(event,data) {
     // you could inspect the data to see if what you care about changed, or just update your own scope
     console.log('scope favorites changed!', data, $scope);
     $scope.favorites = data.favorites;
     $scope.$digest(); // notify the scope that new data came in
   });

})

.controller('SerieCtrl',  

	function(TheTVDB, ThePirateBay, FavoritesService, $routeParams, $scope) {
		console.log('Series controller!', $routeParams.serie, $scope, TheTVDB);
		$scope.episodes = [];
		if(FavoritesService.favorites.length > 0) {
			$scope.serie = FavoritesService.getById($routeParams.id);
		}
		$scope.$on('favorites:updated', function(event,favorites) {
			$scope.serie = favorites.getById($routeParams.id);
			console.log("Scope serie found: ", $scope.serie);
			$scope.$digest();
		});
		$scope.searching = false;
		var currentDate = new Date();

		/**
		 * Check if airdate has passed
		 */
		$scope.hasAired = function(serie) {
			return serie.firstaired && serie.firstaired <= currentDate;
		};

		$scope.getSearchString = function(serie, episode) {
			return "%s S%sE%s".replace('%s', serie.name).replace('%s', episode.season).replace('%s', episode.episode);
		};

		$scope.searchTPB = function(serie, episode) {
			$scope.items = [];
			$scope.searching = true;
			var search = $scope.getSearchString(serie, episode);
			console.log("Search: ", search);
			 ThePirateBay.search(search).then(function(results) {
			 	$scope.items = results;
			 	$scope.searching = false;
			 	console.log('Added episodes: ', $scope);
			 }, function(e) { 
			 	console.error("TPB search failed!"); 
			 	$scope.searching = false; 
			 });
		}

		TheTVDB.findEpisodes($routeParams.id).then(function(data) {
			console.log("Found episodes: ", data);
			for(var i=0; i<data.episodes; i++) {
				data.episodes[i].items = [];
			}
			$scope.episodes = data.episodes;
		}, function(err) {
			console.log("Episodes booh!", err);
	});
})


.controller('SettingsCtrl', 
  function($scope, $location, UserService) {
    $scope.user = UserService.user;

    $scope.save = function() {
      UserService.save();
      $location.path('/');
    }
    //$scope.fetchCities = Weather.getCityDetails;
});