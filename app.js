import React from 'react';

import {render} from 'react-dom';

import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {MapView} from '@deck.gl/core';
import {IconLayer} from '@deck.gl/layers';

import {load} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/csv';

// Data source
const DATA_URL = 'https://raw.githubusercontent.com/datopian/team/master/data/team.csv';

const MAP_VIEW = new MapView({repeat: true});
const INITIAL_VIEW_STATE = {
  longitude: -35,
  latitude: 36.7,
  zoom: 1.8,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

/* eslint-disable react/no-deprecated */
export default function App({data}) {
  const layerProps = {
    data,
    pickable: true,
    getPosition: d => [d.lng, d.lat],
    iconAtlas: 'https://raw.githubusercontent.com/datopian/global-presence/master/img/icon.png',
    iconMapping: {
      marker: {x: 0, y: 0, width: 128, height: 128, mask: true}
    }
  };

  const layer = new IconLayer({
    ...layerProps,
    id: 'icon',
    getIcon: d => 'marker',
    sizeScale: 15,
		getSize: d => 1.5,
    getColor: d => [255,158,86]
  });

  return (
    <>
      <DeckGL
        views={MAP_VIEW}
        initialViewState={INITIAL_VIEW_STATE}
        controller={{dragRotate: false}}
        controller={true}
        layers={[layer]}
				getTooltip={
          ({object}) => object && {
            html: `<h4 style="margin: 0">${object.fullname}</h4>${object.position}<br /><img src=${object.avatar} width=50/>`,
            style: {
              backgroundColor: '#fff',
              fontSize: '0.8em'
            }
          }
        }
      >
        <StaticMap reuseMaps mapStyle={MAP_STYLE} preventStyleDiffing={true} />
      </DeckGL>
    </>
  );
}

export function renderToDOM(container) {
  load(DATA_URL, CSVLoader, {csv: {skipEmptyLines: true}})
    .then((team) => {
      render(<App data={team} />, container);
    });
}