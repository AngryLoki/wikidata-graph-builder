itemLabel = (el) -> el.itemLabel?.value ||
                    el.item.value.match("^http://www\.wikidata\.org/entity/(.+)$")?[1] ||
                    el.item.value

prepareData = (data) ->
  hasSize = "size" in data.head.vars

  bindings = data.results.bindings
  minSize = Infinity
  maxSize = 0

  nodes = {}
  if hasSize
    for el in bindings
      continue if nodes[el.item.value]
      size = parseInt el.size.value
      minSize = size if size < minSize
      maxSize = size if size > maxSize

      nodes[el.item.value] =
        name: itemLabel el
        url: el.item.value
        hasLink: !!el.linkTo
        size: size
  else
    for el in bindings
      nodes[el.item.value] =
        name: itemLabel el
        url: el.item.value
        hasLink: !!el.linkTo

  links = (source: nodes[el.item.value], target: nodes[el.linkTo.value] for el in bindings when nodes[el.linkTo?.value])

  {hasSize, nodes, links, minSize, maxSize}

insertData = (graph, data, activeItem, mode, sizeLogScale) ->
  graph.selectAll("*").remove()
  d3.selectAll("#graph-tooltip").remove()

  return if not data or not data.head

  {hasSize, nodes, links, minSize, maxSize} = prepareData data

  if hasSize
    useLogScale = sizeLogScale
    scaleRange = [3, 20]
    if useLogScale
      radscaler = d3.scale.log().clamp(true).domain([Math.max(1e-12, minSize), Math.max(1e-12, maxSize)]).range(scaleRange)
    else
      radscaler = d3.scale.linear().domain([minSize, maxSize]).range(scaleRange)

    for nodeid, node of nodes
      node.radius = radscaler node.size

  svg = graph.append('svg').attr(xmlns: "http://www.w3.org/2000/svg", xlink: "http://www.w3.org/1999/xlink")
  tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0)

  transform = (d) -> "translate(#{d.x},#{d.y})"

  useGroups = no

  tick = (e) ->
    if useGroups
      groups = {}

      circle.each (d) ->
        group = d.name.toLowerCase() > 'k'
        groups[group] = x: 0.0, y: 0.0, s: 0 if not groups[group]
        groups[group].x += d.x
        groups[group].y += d.y
        groups[group].s++
        return

      for group, ob of groups
        groups[group].x /= groups[group].s
        groups[group].y /= groups[group].s

      k = 6 * e.alpha
      circle.each (d) ->
        group = d.name.toLowerCase()  > 'k'
        d.x = d.x * (1 - k) + groups[group].x * k
        d.y = d.y * (1 - k) + groups[group].y * k

        d.x += -d.x*k if d.x < 0
        d.x -= (d.x - width)*k if d.x > width
        d.y += -d.y*k if d.y < 0
        d.y -= (d.y - height)*k if d.y > height
        return

    if hasSize
      length = ({x, y}) -> Math.sqrt(x*x + y*y)
      sum = ({x:x1, y:y1}, {x:x2, y:y2}) -> x: x1+x2, y: y1+y2
      diff = ({x:x1, y:y1}, {x:x2, y:y2}) -> x: x1-x2, y: y1-y2
      prod = ({x, y}, scalar) -> x: x*scalar, y: y*scalar
      div = ({x, y}, scalar) -> x: x/scalar, y: y/scalar
      scale = (vector, scalar) -> prod vector, scalar / length vector

      line
      .each (d) ->
        {source, target} = d
        if source.x is target.x and source.y is target.y
          d.sp = source
          d.tp  = target
          return
        dvec = diff target, source
        d.sp = sum source, scale dvec, source.radius
        d.tp  = diff target, scale dvec, target.radius

        return
      .attr
        x1: ({sp}) -> sp.x
        y1: ({sp}) -> sp.y
        x2: ({tp}) -> tp.x
        y2: ({tp}) -> tp.y
    else
      line.attr
        x1: ({source}) -> source.x
        y1: ({source}) -> source.y
        x2: ({target}) -> target.x
        y2: ({target}) -> target.y

    circle.attr transform: transform
    text.attr transform: transform
    return

  zoomed = ->
    container.attr 'transform', "translate(#{d3.event.translate})scale(#{d3.event.scale})"
    return

  zoom = d3.behavior.zoom().on('zoom', zoomed)
  force = d3.layout.force()
  drag = force.drag().on "dragstart", -> d3.event.sourceEvent.stopPropagation(); return

  linkDistance = if useGroups then 1 else 30
  charge = if useGroups then -5000 else -200
  gravity = if useGroups then .05 else .05

  force.nodes(d3.values nodes).links(links)
       .linkDistance(linkDistance).charge(charge).gravity(gravity)
       .on('tick', tick).start()

  svg.attr("pointer-events", "all")
  svg.selectAll('*').remove()

  arrowOffset = if hasSize then 0 else 6

  svg.append('defs').selectAll('marker').data(['direction']).enter()
     .append('marker').attr(
      id: ((d) -> d), viewBox: "0 -5 10 10", refX: 10 + arrowOffset - 1,
      markerWidth: 6, markerHeight: 6, orient: 'auto')
     .append('path').attr(d: 'M0,-5L10,0L0,5')

  svg_group = svg.append("g").attr("transform", "translate(0,0)").call(zoom)

  drag_rect = svg_group.append("rect")
            .style("fill", "none")

  container = svg_group.append("g")

  line = container.append('g').selectAll('line').data(force.links()).enter()
            .append('line').attr('marker-end': 'url(#direction)')

  radius = if hasSize then ((d) -> d.radius) else 6

  circle = container.append('g').selectAll('circle').data(force.nodes()).enter()
  .append('circle').attr(r: radius, cx: ((d) -> d.x), cy: ((d) -> d.y))

  if hasSize
    tooltipFn = (d) -> "#{d.name}<br/>Size: #{d.size}"
  else
    tooltipFn = (d) -> d.name

  if hasSize
    circle
    .on "mouseover", (d) ->
      tooltip.transition().duration(100).style("opacity", .9)
      tooltip.html(tooltipFn d)
      .style("left", (d3.event.pageX + 5) + "px")
      .style("top", (d3.event.pageY + 5) + "px")
    .on "mouseout", (d) ->
      tooltip.transition().duration(200).style("opacity", 0)


  if mode is 'undirected'
    circle.classed('linked', (o) -> o.hasLink)

  circle.classed('active', (o) -> o.url.endsWith(activeItem))
  circle.call(drag)

  text = container.append('g').selectAll('text').data(force.nodes()).enter()
            .append('text').attr(x: 8, y: '.31em')
            .text((d) -> d.name).on('click', (o) -> window.open o.url; return)

  width = height = 0

  resize = ->
    # sidenavWidth = document.getElementsByTagName('md-sidenav')[0].offsetWidth
    sidenavWidth = 300
    width = window.innerWidth - sidenavWidth
    height = window.innerHeight
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
  replace: no
  scope:
    graphData: '='
    activeItem: '='
    mode: '='
    sizeLogScale: '='

  link: (scope, element, attrs) ->
    scope.$watch 'graphData', (newValue, oldValue) ->
      graph = d3.select(element[0])
      insertData(graph, scope.graphData, scope.activeItem, scope.mode, scope.sizeLogScale)
    return
