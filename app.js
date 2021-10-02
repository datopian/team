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

function makeCircleImage(radius, src, success) {
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = radius * 2;
  var ctx = canvas.getContext('2d');
  var img = new Image();
  img.crossOrigin='anonymous';
  img.src = src;
  return new Promise((resolve, reject) => {
    img.onload = function() {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // we use compositing, offers better antialiasing than clip()
      ctx.globalCompositeOperation = 'destination-in';
      ctx.arc(radius, radius, radius, 0, Math.PI*2);
      ctx.fill();
      resolve(canvas.toDataURL());
    };
    img.onerror = reject;
  })
}

/* eslint-disable react/no-deprecated */
export default function App({data}) {
  const dataWithAvatarsLoaded = Promise.all(data.map(async (item) => {
    let avatarDataUrl = item.avatar;
    try {
      avatarDataUrl = await makeCircleImage(64, item.avatar);
    } catch(e) {
      console.error(e);
    }
    return { ...item, avatarDataUrl };
  }));

  const layer = new IconLayer({
    id: 'icon',
    data: dataWithAvatarsLoaded,
    pickable: true,
    getIcon: d => ({
      url: d.avatarDataUrl,
      width: 128,
      height: 128
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