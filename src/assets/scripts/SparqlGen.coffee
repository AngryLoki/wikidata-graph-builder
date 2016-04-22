SparqlGen = angular.module('SparqlGen', [])

SparqlGenService = () ->
  capitalize = (str) -> str.charAt(0).toUpperCase() + str.slice(1)

  useGas = (data) -> data.limit isnt 0 or data.iterations isnt 0 or data.mode is 'undirected'

  genSparqlClause = (data, mode = data.mode) ->
    if mode is "both"
      "{ #{genSparqlClause data, 'forward'} } UNION { #{genSparqlClause data, 'reverse'} }"
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

  @generate = (data) ->
    return if not data.item or not data.property

    out = if useGas data then "PREFIX gas: <http://www.bigdata.com/rdf/gas#>\n\n" else ""

    if data.size_property
      out +
      """
      SELECT ?item ?itemLabel ?linkTo ?size {
        { SELECT ?item (count(distinct ?element) as ?size) {
        #{genSparqlClause data}
        OPTIONAL { ?element wdt:#{data.size_property}#{if data.size_recursive then '*' else ''} ?item }
        } GROUP BY ?item }
        OPTIONAL { ?item wdt:#{data.property} ?linkTo }
        SERVICE wikibase:label {bd:serviceParam wikibase:language "#{data.lang}" }
      }
      """
    else
      out +
      """
      SELECT ?item ?itemLabel ?linkTo {
        #{genSparqlClause data}
        OPTIONAL { ?item wdt:#{data.property} ?linkTo }
        SERVICE wikibase:label {bd:serviceParam wikibase:language "#{data.lang}" }
      }
      """

  return

SparqlGenService.$inject = []

SparqlGen.service 'SparqlGenService', SparqlGenService
