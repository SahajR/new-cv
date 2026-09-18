import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cityMapPresentation, createMapClusters } from '../src/scripts/travel-map-clusters.ts';

test('the overview hides individual sights; street scale reveals them without oversized icons', () => {
  assert.equal(cityMapPresentation(1).landmarks, 0);
  assert.equal(cityMapPresentation(2).geography, 0);
  assert.equal(cityMapPresentation(30).geography, 1);
  assert.equal(cityMapPresentation(200).landmarks, 0);
  assert.ok(cityMapPresentation(500).landmarks > 0 && cityMapPresentation(500).landmarks < 1);
  for (const zoom of [850, 1100, 1600]) {
    const style = cityMapPresentation(zoom);
    assert.equal(style.landmarks, 1);
    assert.ok(Math.abs(style.symbolScale * zoom - 2) < 1e-12, 'country zoom does not enlarge the cutouts indefinitely');
  }
});

test('a smaller city zoom fully reveals its landmarks at the same readable size', () => {
  assert.equal(cityMapPresentation(1, 600).landmarks, 0);
  const approaching = cityMapPresentation(300, 600);
  assert.ok(approaching.landmarks > 0 && approaching.landmarks < 1);
  const arrived = cityMapPresentation(600, 600);
  assert.equal(arrived.landmarks, 1);
  assert.equal(arrived.geography, 1);
  assert.ok(Math.abs(arrived.symbolScale * 600 - 2) < 1e-12);
});

test('Japan regional zooms finish revealing both geography and readable landmarks', () => {
  for (const zoom of [40,120,150]) {
    const overview = cityMapPresentation(1,zoom);
    const regional = cityMapPresentation(zoom,zoom);
    assert.equal(overview.landmarks,0);
    assert.equal(regional.geography,1);
    assert.equal(regional.landmarks,1);
    assert.ok(Math.abs(regional.symbolScale*zoom-2)<1e-12);
  }
});

function node(dataset = {}) {
  const attrs = new Map();
  return { dataset, style: {}, attrs,
    setAttribute: (key, value) => attrs.set(key, value),
    removeAttribute: key => { attrs.delete(key); },
    toggleAttribute: (key, enabled) => enabled ? attrs.set(key, '') : attrs.delete(key),
  };
}

test('city entry, offscreen targets, exit and cleanup keep the map usable by keyboard', () => {
  const city = node({ mapCity: 'shanghai', cityZoom: '1100' });
  const countryStop = node({ mapStop: 'west-lake' });
  const bund = node({ stopCluster: 'shanghai', mapX: '513', mapY: '260' });
  const zoo = node({ stopCluster: 'shanghai', mapX: '512', mapY: '261' });
  const symbols = [bund, zoo].map(marker => ({ ...node(), closest: () => marker }));
  const detail = node({ mapDetail: 'shanghai' });
  const overview = node({ mapClusterOverview: 'shanghai' });
  const base = node(), back = node(), credit = node();
  const all = { '[data-map-city]': [city], '[data-map-stop]': [countryStop, bund, zoo], '[data-map-detail]': [detail], '[data-map-cluster-overview]': [overview], '[data-cluster-symbol]': symbols };
  const single = { '.painted-map-base': base, '[data-map-city-back]': back, '[data-map-city-credit]': credit };
  const map = { dataset: {}, querySelectorAll: s => all[s] ?? [], querySelector: s => single[s] };
  const canvas = { viewBox: { baseVal: { x: 0, y: 0, width: 560, height: 295 } }, getBoundingClientRect: () => ({ width: 350, height: 205 }) };
  const clusters = createMapClusters(map, canvas);
  clusters.setCluster('shanghai');
  clusters.render({ x: 280 - 513 * 1100, y: 147.5 - 260 * 1100, scale: 1100 });
  assert.equal(bund.attrs.get('tabindex'), '0');
  assert.equal(zoo.attrs.get('tabindex'), '-1', 'an offscreen landmark cannot receive invisible focus');
  assert.equal(countryStop.attrs.get('aria-hidden'), 'true');
  assert.equal(city.attrs.get('tabindex'), '-1');
  assert.equal(base.style.opacity, '0');
  assert.equal(detail.style.opacity, '1');
  assert.equal(back.hidden, false);
  clusters.setCluster('');
  clusters.render({ x: 0, y: 0, scale: 1 });
  assert.equal(bund.attrs.get('tabindex'), '-1');
  assert.equal(city.attrs.get('tabindex'), '0');
  assert.equal(countryStop.attrs.get('aria-hidden'), 'false');
  assert.equal(base.style.opacity, '1');
  assert.equal(detail.style.opacity, '0');
  assert.equal(back.hidden, true);
  assert.equal(credit.hidden, true);
  clusters.cleanup();
  assert.equal(map.dataset.activeCluster, undefined);
  assert.equal(symbols[0].attrs.has('transform'), false);
});

test('switching Japan areas replaces the visible geography and keyboard targets', () => {
  const cities = [node({mapCity:'kansai',cityZoom:'40'}),node({mapCity:'fuji',cityZoom:'120'})];
  const osaka = node({stopCluster:'kansai',mapX:'387',mapY:'254'});
  const lake = node({stopCluster:'fuji',mapX:'548',mapY:'240'});
  const symbols = [osaka,lake].map(marker => ({...node(),closest:()=>marker}));
  const details = [node({mapDetail:'kansai'}),node({mapDetail:'fuji'})];
  const overviews = [node(),node()];
  const base = node();
  const all = {'[data-map-city]':cities,'[data-map-stop]':[osaka,lake],'[data-map-detail]':details,'[data-map-cluster-overview]':overviews,'[data-cluster-symbol]':symbols};
  const map = {dataset:{},querySelectorAll:s=>all[s]??[],querySelector:s=>s==='.painted-map-base'?base:undefined};
  const canvas = {viewBox:{baseVal:{x:40,y:-10,width:890,height:425}},getBoundingClientRect:()=>({width:390,height:205})};
  const clusters = createMapClusters(map,canvas);
  for (const [id,zoom,x,y,current,other,detail] of [
    ['kansai',40,387,254,osaka,lake,0],
    ['fuji',120,548,240,lake,osaka,1],
    ['kansai',40,387,254,osaka,lake,0],
  ]) {
    clusters.setCluster(id);
    clusters.render({scale:zoom,x:485-x*zoom,y:202.5-y*zoom});
    assert.equal(current.attrs.get('tabindex'),'0');
    assert.equal(other.attrs.get('tabindex'),'-1');
    assert.equal(current.style.visibility,'visible');
    assert.equal(other.style.visibility,'hidden');
    assert.equal(details[detail].style.opacity,'1');
    assert.equal(details[1-detail].style.opacity,'0');
  }
  clusters.setCluster('');
  clusters.render({scale:1,x:0,y:0});
  assert.ok(cities.every(city=>city.attrs.get('tabindex')==='0'));
  assert.ok(overviews.every(overview=>overview.style.visibility==='visible'));
  assert.ok([osaka,lake].every(marker=>marker.attrs.get('tabindex')==='-1'));
});
