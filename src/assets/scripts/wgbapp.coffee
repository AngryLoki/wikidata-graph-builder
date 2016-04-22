FormCtrl = ($scope, $log, $location, $rootScope, $mdToast, $mdDialog, WikiToolsService, SparqlGenService) ->
  @modes =
    forward: 'Forward'
    reverse: 'Reverse'
    both: 'Bidirectional'
    undirected: 'Undirected'
    wdqs: 'WDQS'

  fields =
    property: type: 'property'
    item: type: 'item'
    lang: type: 'lang', default: 'en'
    iterations: type: 'number', default: 0
    limit: type: 'number', default: 0
    mode: type: 'enum', values: @modes, default: 'forward', extractor: (params) -> params.mode || params.direction
    wdqs: type: 'text'
    size_property: type: 'property'
    size_recursive: type: 'boolean'
    size_log_scale: type: 'boolean'

  getDataFromUrl = () ->
    params = $location.search()
    data = {}

    for field, spec of fields
      param = if spec.extractor then spec.extractor(params) else params[field]
      data[field] = switch spec.type
        when 'property' then (if /^P\d+$/.test(param or '') then param else spec.default)
        when 'item' then (if /^Q\d+$/.test(param or '') then param else spec.default)
        when 'lang' then (if /^[a-z-]{2,}$/.test(param or '') then param else spec.default)
        when 'number' then (if /^\d+$/.test(param or '') then parseInt(param) else spec.default)
        when 'text' then param || spec.default
        when 'enum' then (if spec.values[param] then param else spec.default)
        when 'boolean' then param in [1, true, '1', 'true']

    data.wdqs = SparqlGenService.generate data if not data.wdqs
    data

  dynamicFields = (key for key, value of fields when value.type in ['item', 'property'])

  dynamicFields.forEach (ob) =>
    $scope.$watch (=> @[ob]), (name) =>
      return @[ob + 'Object'] = @[ob + 'Text'] = undefined if not name
      WikiToolsService.getEntity(name, @lang).then((result) => @[ob + 'Object'] = result)

  $scope.$watch (=> @lang), (lang) =>
    return if not lang
    dynamicFields.forEach (name) =>
      obname = name + 'Object'
      if @[obname] and @[obname].lang isnt lang
        @[obname].lang = lang
        WikiToolsService.getEntity(@[obname].id, lang).then((result) => @[obname] = result if @[obname].lang is lang)

  rebuildFromUrl = () =>
    data = getDataFromUrl()
    for key, value of data
      @[key] = value
      @[key + 'Object'] = @[key + 'Text'] = undefined if not value and fields[key].type in ['item', 'property']
    @graphData = undefined if not @validate()
    regenSvg(data) if data.wdqs
    return

  $rootScope.$on '$locationChangeSuccess', rebuildFromUrl

  @itemSearch = (query) -> WikiToolsService.searchEntities 'item', query, @lang
  @propertySearch = (query) -> WikiToolsService.searchEntities 'property', query, @lang
  @reset = -> $location.search({})
  @validate = -> @mode is 'wdqs' and @wdqs or @mode isnt 'wdqs' and @lang and @itemObject and @propertyObject

  @submit = ->
    data = {}

    if @mode is 'wdqs'
      data.mode = 'wdqs'
      data.wdqs = @wdqs
    else
      for field, spec of fields when field isnt 'wdqs'
        if spec.type in ['item', 'property']
          data[field] = @[field + 'Object']?.id or spec.default
        else if spec.type is 'boolean'
          data[field] = ~~@[field] unless @[field] is !!spec.default
        else
          data[field] = @[field] unless @[field] is spec.default

    if JSON.stringify($location.search()) is JSON.stringify(data) then rebuildFromUrl() else $location.search data

  errorToast = (message, more) ->
    toast = $mdToast.simple().textContent(message).hideDelay(5000)
    if more
      toast.action('More info').highlightAction(true)
    toast = $mdToast.show(toast).then (response) =>
      if more and response is 'ok'
        tpl = angular.element("<md-dialog />")
                     .attr('aria-label', message)
                     .append(angular.element("<pre />").text(more))
        $mdDialog.show
          clickOutsideToClose: true
          template: tpl[0].outerHTML

  regenSvg = (data) =>
    query = data.wdqs
    start_time = new Date().getTime()

    insertSuccess = (response) =>
      @isLoading = false
      @activeItem = data.item
      @graphData = response.data

    insertError = (response) =>
      @isLoading = false
      $log.error 'unable to process answer', response.data
      request_time = new Date().getTime() - start_time
      if request_time < 10*1000
        errorToast 'Something is wrong with SPARQL query syntax', response.data
      else
        errorToast 'SPARQL query times out'
      return

    @isLoading = true
    WikiToolsService.wdqs(query).then(insertSuccess, insertError)

    @showSvg = true
    return

  @query = ->
    data = getDataFromUrl()
    window.open 'https://query.wikidata.org/#' + encodeURIComponent data.wdqs
    return

  @svg = ->
    serializer = new XMLSerializer()
    source = serializer.serializeToString $('svg')[0]
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source
    url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent source
    window.open url
    return

  @list = ->
    data = getDataFromUrl()
    url = "https://tools.wmflabs.org/wikidata-todo/tree.html?q=#{data.item.slice 1}"
    url += "&rp=#{data.property.slice 1}" if data.mode in ['reverse', 'both']
    url += "&p=#{data.property.slice 1}" if data.mode in ['forward', 'both']
    url += "&depth=#{data.iterations}" unless data.iterations is 0
    url += "&lang=#{data.lang}" unless data.lang is 'en'
    window.open url
    return
  return

FormCtrl.$inject = [
  '$scope', '$log', '$location', '$rootScope', '$mdToast', '$mdDialog', 'WikiToolsService', 'SparqlGenService'
]

app = angular.module 'WgbApp', ['ngMaterial', 'WikiTools', 'Graph', 'SparqlGen']

app.config ['$locationProvider', ($locationProvider) ->
  $locationProvider.html5Mode enabled: true, requireBase: false
  return
]

app.controller 'FormCtrl', FormCtrl
