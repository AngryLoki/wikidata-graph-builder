itemLabel = (el) -> el.itemLabel and el.itemLabel.value ||
                    el.item.value.startsWith("http://www.wikidata.org/entity/") and el.item.value.slice(31) ||
                    el.item.value

insertData = (graph, data, activeItem, mode) ->
  graph.selectAll("*").remove()
  return if not data

  svg = graph.append('svg').attr(xmlns: "http://www.w3.org/2000/svg", xlink: "http://www.w3.org/1999/xlink")

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

  zoomed = ->
    container.attr 'transform', "translate(#{d3.event.translate})scale(#{d3.event.scale})"
    return

  zoom = d3.behavior.zoom().on('zoom', zoomed)

  force = d3.layout.force()

  drag = force.drag().on "dragstart", -> d3.event.sourceEvent.stopPropagation(); return

  force.nodes(d3.values nodes).links(links)
       .linkDistance(30).charge(-200).gravity(.05).on('tick', tick).start()

  svg.attr("pointer-events", "all")
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

  resize = ->
    toolbarHeight = document.getElementsByTagName('md-toolbar')[0].offsetHeight
    width = window.innerWidth
    height = window.innerHeight - toolbarHeight
    # graph.style width: width+'px', height: height+'px'
    graph.style height: height+'px'
    svg.attr width: width, height: height
    drag_rect.attr width: width, height: height
    force.size([width, height]).resume()
    return

  resize()
  d3.select(window).on 'resize', resize
  return

app = angular.module('Graph', [])

app.directive 'graph', ->
  restrict: 'E'
  replace: false
  scope:
    graphData: '='
    activeItem: '='
    mode: '='

  link: (scope, element, attrs) ->
    scope.$watch 'graphData', (newValue, oldValue) ->
      graph = d3.select(element[0])
      insertData(graph, scope.graphData, scope.activeItem, scope.mode)
    return
