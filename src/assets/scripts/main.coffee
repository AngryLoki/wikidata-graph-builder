setFields = (fields) ->
  for fieldName, id of fields when fieldName isnt 'randomData'
    $field = $ "[name=#{fieldName}]"
    if fieldName in ['lang', 'iterations', 'limit']
      if $field.val() isnt id
        $field.val(id)
    else if fieldName is 'direction'
      if $field.find(':selected').val() isnt id.toLowerCase()
        $field.val(id.toLowerCase())
    else
      if $field.find(':selected').val() isnt id
        $option = $('<option selected />').val(id).text('Loading...')
        $field.append($option)
        $field.trigger('change')
        setOptionText $field, $option, id

setOptionText = ($field, $option, id) ->
  $.getJSON(
    'https://www.wikidata.org/w/api.php?callback=?',
    action: 'wbsearchentities'
    search: id
    uselang: $('[name=lang]').val() or History.getState().data.lang or 'en'
    language: $('[name=lang]').val() or History.getState().data.lang or 'en'
    type: if id.startsWith('Q') then 'item' else 'property'
    format: 'json'
    formatversion: 2
    limit: 1
  ).then (data) ->
    $option.text(data.search?[0].label or id)
    $option.removeData()
    $field.trigger('change')
    return


formatItemSelection = (item) -> item.label or item.text

formatItem = (item) ->
  "<div><div class=\"item-name\">#{item.label or item.text}</div>" +
  (if item.description then "<div class=\"item-descrition\">#{item.description}</div>" else "") +
  "</div>"


setupSelect = ($field, type, placeholder) ->
  $field.select2
    placeholder: placeholder
    theme: 'bootstrap'
    ajax:
      url: 'https://www.wikidata.org/w/api.php'
      dataType: 'jsonp'
      cache: true
      data: (params) ->
        action: 'wbsearchentities'
        search: params.term or $field.val()
        uselang: $('[name=lang]').val() or History.getState().data.lang or 'en'
        language: $('[name=lang]').val() or History.getState().data.lang or 'en'
        type: type
        format: 'json'
        formatversion: 2
        continue: params.next || 0

      processResults: (data, params) ->
        params.next = data['search-continue']
        results: data.search, pagination: more: data['search-continue']
    minimumInputLength: 1
    templateResult: formatItem
    templateSelection: formatItemSelection
    escapeMarkup: (markup) -> markup

$ ->
  $('.navbar-brand').attr('href', window.location.href.split('?')[0])

  $('form').validate
    errorPlacement: -> return

    highlight: (element) ->
      $(element).parent().addClass('has-error')
      return

    unhighlight: (element) ->
      $(element).parent().removeClass('has-error')
      return

    rules:
      item:
        required: true
        regex: /^Q\d+$/
      property:
        required: true
        regex: /^P\d+$/
      lang:
        required: true
        minlength: 2
        regex: /^[a-z-]+$/

  $('form').on 'submit', submitHandler

  setupSelect $('select[name=item]'), 'item', 'Item, e. g Q42196'
  setupSelect $('select[name=property]'), 'property', 'Property, e. g P171'

  params = getUrlParams()
  History.replaceState params
  setFields params
  updateState()

  History.Adapter.bind window, 'statechange', updateState
  $('#openSparql').click openSparql
  $('#openSvg').click openSvg
  $('#openWdTree').click openWdTree

defaults =
  property: ''
  item: ''
  lang: 'en'
  direction: 'Forward'
  iterations: 0
  limit: 0

submitHandler = (event) ->
  return if not $('form').valid()
  $property = $(this).find('[name=property] :selected')
  $item = $(this).find('[name=item] :selected')
  $lang = $(this).find('[name=lang]')
  $direction = $(this).find('[name=direction]')
  $iterations = $(this).find('[name=iterations]')
  $limit = $(this).find('[name=limit]')

  data =
    randomData: Math.random()
    property: $property.val()
    item: $item.val()
    lang: $lang.val()
    direction: if $direction.val() == 'reverse' then 'Reverse' else 'Forward'
    iterations: parseInt $iterations.val()
    limit: parseInt $limit.val()

  urldata = {}
  urldata[key] = data[key] for key, value of defaults when data[key] isnt value
  urldata.direction = urldata.direction.toLowerCase() if urldata.direction

  History.pushState data, '', '?' + $.param(urldata)
  false

getUrlParams = ->
  pl = /\+/g
  search = /([^&=]+)=?([^&]*)/g

  decode = (s) -> decodeURIComponent s.replace pl, ' '

  query = window.location.search.substring 1
  urlParams = {}
  while match = search.exec query
    urlParams[decode match[1]] = decode match[2]

  item: urlParams.item or defaults.item
  property: urlParams.property or defaults.property
  lang: urlParams.lang or defaults.lang
  direction: if urlParams.direction is 'reverse' then 'Reverse' else 'Forward'
  iterations: parseInt(urlParams.iterations) or defaults.iterations
  limit: parseInt(urlParams.limit) or defaults.limit


genSparql = (data) ->
  """
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX gas: <http://www.bigdata.com/rdf/gas#>

SELECT ?item ?itemLabel ?parent {
  { SERVICE gas:service {
     gas:program gas:gasClass "com.bigdata.rdf.graph.analytics.SSSP" ;
                 gas:in wd:#{data.item} ;
                 gas:traversalDirection "#{data.direction}" ;
                 gas:out ?item ;
                 gas:out1 ?depth ;#{if data.iterations is 0 then "" else
                   "\n                 gas:maxIterations #{data.iterations} ;"
                 }#{if data.limit is 0 then "" else
                   "\n                 gas:maxVisited #{data.limit} ;"
                 }
                 gas:linkType wdt:#{data.property} .
    }
  } .
  OPTIONAL { ?item wdt:#{data.property} ?parent }
  SERVICE wikibase:label {bd:serviceParam wikibase:language "#{data.lang}" }
}
"""


insertData = (data) ->
  activeItem = History.getState().data.item
  bindings = data.results.bindings
  nodes = {}
  nodes[el.item.value] = name: el.itemLabel.value, url: el.item.value for el in bindings
  links = (source: nodes[el.item.value], target: nodes[el.parent.value] for el in bindings when nodes[el.parent?.value])

  link = (d) -> "M#{d.source.x},#{d.source.y}A0,0 0 0,1 #{d.target.x},#{d.target.y}"
  transform = (d) -> "translate(#{d.x},#{d.y})"

  tick = ->
    path.attr d: link
    circle.attr transform: transform
    text.attr transform: transform
    return


  resize = ->
    width = window.innerWidth
    height = window.innerHeight - $('nav').outerHeight() - 10
    svg.attr width: width, height: height
    force.size([width, height]).resume()
    return

  force = d3.layout.force().nodes(d3.values nodes).links(links)
            .linkDistance(30).charge(-200).gravity(.05).on('tick', tick).start()

  svg = d3.select('svg')
  svg.selectAll('*').remove()

  svg.append('style').text("""
  .link {
    stroke: #000;
    stroke-width: 1.5px;
  }

  circle {
    fill: #ccc;
    stroke: #333;
    stroke-width: 1.5px;
  }

  text {
    font: 10px sans-serif;
    text-shadow: 0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff;
    cursor: pointer;
  }

  .active {
    fill: #6BB9F0;
  }
  """)

  svg.append('defs').selectAll('marker').data(['direction']).enter()
     .append('marker').attr(
      id: ((d) -> d), viewBox: '0 -5 10 10', refX: 15,
      refY: -1.5, markerWidth: 6, markerHeight: 6, orient: 'auto')
     .append('path').attr(d: 'M0,-5L10,0L0,5')

  path = svg.append('g').selectAll('path').data(force.links()).enter()
            .append('path').attr('class': 'link', 'marker-end': 'url(#direction)')

  circle = svg.append('g').selectAll('circle').data(force.nodes()).enter()
              .append('circle').attr(r: 6)
              .classed('active', (o) ->
                console.log o, o.url.endsWith(activeItem)
                o.url.endsWith(activeItem)
              ).call(force.drag)

  text = svg.append('g').selectAll('text').data(force.nodes()).enter()
            .append('text').attr(x: 8, y: '.31em')
            .text((d) -> d.name).on('click', (o) -> window.open o.url; return)

  resize()
  d3.select(window).on 'resize', resize
  return

$.validator.addMethod 'regex', ((value, element, regexp) ->
  check = false
  @optional(element) or regexp.test(value)
), 'Please check your input.'

updateState = ->
  data = History.getState().data
  setFields data  # set fields to defaults
  query = genSparql data

  if not data.item or not data.property
    $('#main').show()
    $('svg').hide()
  else
    $('#main').hide()
    $('svg').show()
    start_time = new Date().getTime()

    $.getJSON('https://query.wikidata.org/sparql', query: query, insertData)
      .fail((jqXHR, textStatus, errorThrown) ->
        request_time = new Date().getTime() - start_time
        if request_time < 10*1000
          toastr['error'] 'Something is wrong with SPARQL query syntax'
        else
          toastr['error'] 'SPARQL query times out'
        return
      )
  return

openSparql = ->
  return if not $('form').valid()
  data = History.getState().data
  query = genSparql data
  window.open 'https://query.wikidata.org/#' + encodeURIComponent query

openSvg = ->
  return if not $('form').valid()
  serializer = new XMLSerializer()
  source = serializer.serializeToString $('svg')[0]
  source = '<?xml version="1.0" standalone="no"?>\r\n' + source
  url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent source
  window.open url

openWdTree = ->
  return if not $('form').valid()
  data = History.getState().data
  url = "https://tools.wmflabs.org/wikidata-todo/tree.html?q=#{data.item.slice(1)}"
  url += "&#{if data.direction is 'Reverse' then 'rp' else 'p'}=#{data.property.slice(1)}"
  url += "&lang=#{data.lang}" if data.lang isnt 'en'
  window.open url
