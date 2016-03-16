do ->
  capitalize = (string) -> string.charAt(0).toUpperCase() + string.slice(1)

  itemLabel = (el) -> el.itemLabel and el.itemLabel.value ||
                      el.item.value.startsWith("http://www.wikidata.org/entity/") and el.item.value.slice(31) ||
                      el.item.value

  insertData = (data, activeItem, mode) ->
    bindings = data.results.bindings
    nodes = {}
    nodes[el.item.value] = name: itemLabel(el), url: el.item.value, has_link: !!el.linkTo for el in bindings
    links = (source: nodes[el.item.value], target: nodes[el.linkTo.value] for el in bindings when nodes[el.linkTo?.value])

    transform = (d) -> "translate(#{d.x},#{d.y})"

    tick = ->
      line.attr
        x1: (d) -> d.source.x
        y1: (d) -> d.source.y
        x2: (d) -> d.target.x
        y2: (d) -> d.target.y
      circle.attr transform: transform
      text.attr transform: transform
      return

    resize = ->
      toolbarHeight = document.getElementsByTagName('md-toolbar')[0].offsetHeight
      width = window.innerWidth
      height = window.innerHeight - toolbarHeight
      svg.attr width: width, height: height
      drag_rect.attr width: width, height: height
      force.size([width, height]).resume()
      return

    zoomed = ->
      container.attr 'transform', "translate(#{d3.event.translate})scale(#{d3.event.scale})"
      return

    zoom = d3.behavior.zoom().on('zoom', zoomed)

    force = d3.layout.force()

    drag = force.drag().on "dragstart", -> d3.event.sourceEvent.stopPropagation(); return

    force.nodes(d3.values nodes).links(links)
         .linkDistance(30).charge(-200).gravity(.05).on('tick', tick).start()

    svg = d3.select('svg#graph').attr("pointer-events", "all")
    svg.selectAll('*').remove()

    svg.append('defs').selectAll('marker').data(['direction']).enter()
       .append('marker').attr(
        id: ((d) -> d), viewBox: '0 -5 10 10', refX: 15,
        markerWidth: 6, markerHeight: 6, orient: 'auto')
       .append('path').attr(d: 'M0,-5L10,0L0,5')

    svg_group = svg.append("g").attr("transform", "translate(0,0)").call(zoom)

    drag_rect = svg_group.append("rect")
              .style("fill", "none")

    container = svg_group.append("g")

    line = container.append('g').selectAll('line').data(force.links()).enter()
              .append('line').attr('marker-end': 'url(#direction)')

    circle = container.append('g').selectAll('circle').data(force.nodes()).enter()
                .append('circle').attr(r: 6)
                .attr("cx", (d) -> d.x)
                .attr("cy", (d) -> d.y)


    if mode is 'undirected'
      circle.classed('linked', (o) -> o.has_link)

    circle.classed('active', (o) -> o.url.endsWith(activeItem))
    circle.call(drag)

    text = container.append('g').selectAll('text').data(force.nodes()).enter()
              .append('text').attr(x: 8, y: '.31em')
              .text((d) -> d.name).on('click', (o) -> window.open o.url; return)

    resize()
    d3.select(window).on 'resize', resize
    return

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


  FormCtrl = ($timeout, $q, $log, $http, $httpParamSerializer, $scope, $location, $rootScope, $mdToast, $mdDialog) ->
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
        itemRefresh(data.item)
      if data.property and not @property or @property and @property.id isnt data.property
        propertyRefresh(data.property)
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

    wdApiParams = $httpParamSerializer
      format: 'json'
      formatversion: 2
      callback: 'JSON_CALLBACK'

    wdApi = 'https://www.wikidata.org/w/api.php?' + wdApiParams

    searchParams = (type, query, language = @lang) =>
      action: 'wbsearchentities'
      search: query
      uselang: language,
      language: language
      type: type
      continue: 0

    refreshParams = (what, language = @lang) =>
      action: 'wbsearchentities'
      search: what
      uselang: language
      language: language
      type: if what.startsWith('Q') then 'item' else 'property'
      limit: 1

    itemRefresh = (name) =>
      (@item = `void 0`; @itemText = `void 0`; return) if not name
      refreshSuccess = (response) => @item = response.data.search[0]
      refreshError = (response)-> $log.error 'Request failed'; reject 'Request failed'
      $http.jsonp(wdApi, params: refreshParams name).then(refreshSuccess, refreshError)
      return

    propertyRefresh = (name) =>
      (@property = `void 0`; @propertyText = `void 0`; return) if not name
      refreshSuccess = (response)=> @property = response.data.search[0]
      refreshError = (response)-> $log.error 'Request failed'; reject 'Request failed'
      $http.jsonp(wdApi, params: refreshParams name).then(refreshSuccess, refreshError)
      return

    @itemSearch = (query) ->
      $q (resolve, reject) ->
        searchSuccess = (response)-> resolve response.data.search
        searchError = (response)-> $log.error 'Request failed'; reject 'Request failed'
        $http.jsonp(wdApi, params: searchParams 'item', query).then(searchSuccess, searchError)

    @propertySearch = (query) ->
      $q (resolve, reject) ->
        searchSuccess = (response)-> resolve response.data.search
        searchError = (response)-> $log.error 'Request failed'; reject 'Request failed'
        $http.jsonp(wdApi, params: searchParams 'property', query).then(searchSuccess, searchError)

    @reset = ->
      $location.search({})

    @validate = ->
      return @mode is 'wdqs' and @wdqs or @mode isnt 'wdqs' and @property and @item and @property

    @build = ->
      data = {}
      if @mode is 'wdqs'
        data.mode = 'wdqs'
        data.wdqs = @wdqs
      else
        data.property = @property.id
        data.item = @item.id
        data.lang = @lang if @lang isnt 'en'
        data.mode = @mode if @mode isnt 'forward'
        data.iterations = @iterations if @iterations isnt 0
        data.limit = @limit if @limit isnt 0

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

      insertSuccess = (response)=>
        @isLoading = false
        insertData response.data, data.item, data.mode

      insertError = (response)=>
        @isLoading = false
        $log.error 'unable to process answer', response.data
        request_time = new Date().getTime() - start_time
        if request_time < 10*1000
          errorToast 'Something is wrong with SPARQL query syntax', response.data
        else
          errorToast 'SPARQL query times out'
        return

      @isLoading = true
      $http.get('https://query.wikidata.org/sparql', params: query: query).then(insertSuccess, insertError)

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
      url = "https://tools.wmflabs.org/wikidata-todo/tree.html?q=#{data.item.slice(1)}"
      url += "&rp=#{data.property.slice(1)}" if data.mode in ['reverse', 'both']
      url += "&p=#{data.property.slice(1)}" if data.mode in ['forward', 'both']
      url += "&depth=#{data.iterations}" if data.iterations isnt 0
      url += "&lang=#{data.lang}" if data.lang isnt 'en'
      window.open url
      return


    return

  FormCtrl.$inject = [
    '$timeout', '$q', '$log', '$http', '$httpParamSerializer',
    '$scope', '$location', '$rootScope', '$mdToast', '$mdDialog']

  app = angular.module('WgbApp', ['ngMaterial'])

  app.config ['$locationProvider', ($locationProvider) ->
    $locationProvider.html5Mode
      enabled: true
      requireBase: false
    return
  ]

  app.controller('FormCtrl', FormCtrl)
