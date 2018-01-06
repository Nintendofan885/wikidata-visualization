export const examples = [
  { title: 'Country comparison - number of Nobel laureates per capita and GDP per capita',
    filename: 'country-nobel-gdp.rq'
  },
  { title: 'Descendants of Genghis Khan',
    filename: 'genghiskhan-descendants.rq'
  },
  { title: 'Number of marriages between European countries',
    filename: 'europe-marriages.rq'
  },
  {
    title: 'Stars with Bayer designations',
    filename: 'bayer-stars.rq'
  },
  {
    title: 'Academy Award-winning families',
    filename: 'academy-award-family.rq'
  },
  {
    title: 'Number of National Historical and Cultural Sites in each province of China',
    filename: 'china-province-sites.rq'
  },
  {
    title: 'Phylogenetic tree of human mtDNA haplogroups',
    filename: 'mtdna-haplogroup-tree.rq'
  },
  {
    title: 'Richard Feynman\'s Erdos number',
    filename: 'feynman-erdos-number.rq'
  },
  {
    title: '20th-century earthquakes',
    filename: 'earthquakes.rq'
  },
  { title: 'Impressionist and post-impressionist paintings in the Metropolitan Museum of Art',
    filename: 'met-impressionist.rq'}
]

export const readExample = (index) => {
  
  const filename = (process.env.NODE_ENV === 'development')
    ? `/examples/${examples[index]['filename']}`
    : `/wikidata-visualization/examples/${examples[index]['filename']}`
  return fetch(filename).then(res => res.text())
}

