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
  const layer = new IconLayer({
    id: 'icon',
    data,
    pickable: true,
    getIcon: d => ({
      url: d.avatar,
      width: 128,
      height: 128,
      anchorY: 128
    }),
    getSize: d => Math.floor(Math.random() * 36) + 20,
    getPosition: d => [d.lng, d.lat],
    sizeScale: 1
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
            html: `<h4 style="margin: 0">${object.fullname}</h4>${object.position}`,
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