WikiTools = angular.module('WikiTools', [])

WikiToolsService = ($log, $http, $httpParamSerializer) ->
  self = @

  wdApiParams = $httpParamSerializer
    format: 'json'
    formatversion: 2
    callback: 'JSON_CALLBACK'

  @createApi = (param1, param2) ->
    [param1, param2] = ['www', param1] if not param2
    "https://#{param1}.#{param2}.org/w/api.php?#{wdApiParams}"

  @wikidata = @createApi 'wikidata'

  @get = (api, params) ->
    $http.jsonp(api, params: params)

  @searchEntities = (type, query, language) ->
    params =
      action: 'wbsearchentities'
      search: query
      uselang: language,
      language: language
      type: type
      continue: 0

    success = (response) => response.data.search
    error = (response) -> $log.error 'Request failed'; reject 'Request failed'
    self.get(self.wikidata, params).then(success, error)

  @getEntity = (what, language) ->
    params =
      action: 'wbsearchentities'
      search: what
      uselang: language
      language: language
      type: if what.startsWith('Q') then 'item' else 'property'
      limit: 1

    success = (response) => response.data.search[0]
    error = (response) -> $log.error 'Request failed'; reject 'Request failed'
    self.get(self.wikidata, params).then(success, error)

  @wdqs = (query) ->
    $http.get('https://query.wikidata.org/sparql', params: query: query)

  return

WikiToolsService.$inject = ['$log', '$http', '$httpParamSerializer']

WikiTools.service 'WikiToolsService', WikiToolsService
