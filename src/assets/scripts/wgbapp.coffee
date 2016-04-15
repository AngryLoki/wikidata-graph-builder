capitalize = (string) -> string.charAt(0).toUpperCase() + string.slice(1)

useGas = (data) -> data.limit isnt 0 or data.iterations isnt 0 or data.mode is 'undirected'

genSparqlClause = (data, mode = data.mode) ->
  if mode is "both"
    "{ #{genSparqlClause(data, 'forward')} } UNION { #{genSparqlClause(data, 'reverse')} }"
  else if not useGas data
    if mode is "forward" then "wd:#{data.item} wdt:#{data.property}* ?item"
    else if mode is "reverse" then "?item wdt:#{data.property}* wd:#{data.item}"
  else
    """
    SERVICE gas:service {
        gas:program gas:gasClass "com.bigdata.rdf.graph.analytics.SSSP" ;
                    gas:in wd:#{data.item} ;
                    gas:traversalDirection "#{capitalize mode}" ;
                    gas:out ?item ;
                    gas:out1 ?depth ;#{if data.iterations is 0 then "" else
                    "\n                gas:maxIterations #{data.iterations} ;"
                    }#{if data.limit is 0 then "" else
                    "\n                gas:maxVisited #{data.limit} ;"
                    }
                    gas:linkType wdt:#{data.property} .
      }
    """

genSparql = (data) ->
  return if not data.item or not data.property

  out = if useGas data then "PREFIX gas: <http://www.bigdata.com/rdf/gas#>\n\n" else ""
  out +
  """
  SELECT ?item ?itemLabel ?linkTo {
    #{genSparqlClause(data)}
    OPTIONAL { ?item wdt:#{data.property} ?linkTo }
    SERVICE wikibase:label {bd:serviceParam wikibase:language "#{data.lang}" }
  }
  """


FormCtrl = ($log, $location, $rootScope, $mdToast, $mdDialog, WikiToolsService) ->
  @modes = [
    {mode: 'forward', text: 'Forward'}
    {mode: 'reverse', text: 'Reverse'}
    {mode: 'both', text: 'Bidirectional'}
    {mode: 'undirected', text: 'Undirected'}
    {mode: 'wdqs', text: 'WDQS'}
  ]

  modeKeys = (d.mode for d in @modes)

  getDataFromUrl = () ->
    params = $location.search()
    data = {
      property: params.property if /^P\d+$/.test(params.property or '')
      item: params.item if /^Q\d+$/.test(params.item or '')
      lang: if /^[a-z-]{2,}$/.test(params.lang or '') then params.lang else 'en'
      iterations: if /^\d+$/.test(params.iterations or '') then parseInt(params.iterations) else 0
      limit: if /^\d+$/.test(params.limit or '') then parseInt(params.limit) else 0
      mode: if params.mode in modeKeys then params.mode else if params.direction in modeKeys then params.direction else 'forward'
      wdqs: params.wdqs
    }
    data.wdqs = genSparql data if not data.wdqs
    data

  rebuildFromUrlOrData = () =>
    data = getDataFromUrl()

    if @lang isnt data.lang
      @lang = data.lang
    if data.item and not @item or @item and @item.id isnt data.item
      itemRefresh data.item
    if data.property and not @property or @property and @property.id isnt data.property
      propertyRefresh data.property
    if @iterations isnt data.iterations
      @iterations = data.iterations
    if @limit isnt data.limit
      @limit = data.limit
    if @mode isnt data.mode
      @mode = data.mode
    if @wdqs isnt data.wdqs
      @wdqs = data.wdqs

    if data.wdqs
      regenSvg(data)

    return

  $rootScope.$on '$locationChangeSuccess', rebuildFromUrlOrData

  itemRefresh = (name) =>
    return @item = @itemText = undefined if not name
    WikiToolsService.getEntity(name, @lang).then((result) => @item = result)
    return

  propertyRefresh = (name) =>
    return @property = @propertyText = undefined if not name
    WikiToolsService.getEntity(name, @lang).then((result) => @property = result)
    return

  @itemSearch = (query) ->
    WikiToolsService.searchEntities 'item', query, @lang

  @propertySearch = (query) ->
    WikiToolsService.searchEntities 'property', query, @lang

  @reset = ->
    @graphData = null
    $location.search({})

  @validate = ->
    return @mode is 'wdqs' and @wdqs or @mode isnt 'wdqs' and @property and @item and @property

  @build = ->
    data = {}
    data.mode = @mode unless @mode is 'forward'
    if @mode is 'wdqs'
      data.wdqs = @wdqs
    else
      data.property = @property.id
      data.item = @item.id
      data.lang = @lang unless @lang is 'en'
      data.iterations = @iterations unless @iterations is 0
      data.limit = @limit unless @limit is 0

    if JSON.stringify($location.search()) is JSON.stringify(data)
      rebuildFromUrlOrData()
    else
      $location.search data

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
  '$log', '$location', '$rootScope', '$mdToast', '$mdDialog', 'WikiToolsService'
]

app = angular.module('WgbApp', ['ngMaterial', 'WikiTools', 'Graph'])

app.config ['$locationProvider', ($locationProvider) ->
  $locationProvider.html5Mode
    enabled: true
    requireBase: false
  return
]

app.controller('FormCtrl', FormCtrl)
